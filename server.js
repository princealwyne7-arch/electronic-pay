const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let transactions = [];
const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
app.get('/api/status', (req, res) => {
    const successfulTxs = transactions.filter(t => t.status.includes('Successful'));
    const todayTotal = successfulTxs.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    const aiScore = Math.min(999, 800 + (successfulTxs.length * 12));
    res.json({ transactions, todayTotal, aiScore, latency: Math.floor(Math.random() * 35) + 10 });
});
app.post('/admin/push', async (req, res) => {
    const { phone, amount, pin } = req.body;
    if (pin !== "5566") return res.status(403).json({ error: "Access Denied" });
    const trackingId = `BNK-${Date.now()}`;
    transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        res.json({ success: true, trackingId });
    } catch (err) { 
        if(transactions[0]) transactions[0].status = "Failed ❌";
        res.status(500).json({ success: false });
    }
});
app.post('/callback', (req, res) => {
    const { merchant_request_id, state, status } = req.body;
    let tx = transactions.find(t => String(t.id).includes(merchant_request_id));
    if (tx) { tx.status = (state === 'completed' || status === 'success') ? "Successful ✅" : "Cancelled ⚠️"; }
    res.sendStatus(200);
});
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><title>Electronic Pay</title><style>:root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; } body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; overflow-x: hidden; } .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); } .side-drawer { position:fixed; left:-280px; top:0; width:280px; height:100%; background:var(--primary); z-index:4000; transition:0.3s ease; padding:20px; box-sizing:border-box; color:white; } .side-drawer.open { left:0; } .card { background: var(--card); border-radius: 24px; padding: 22px; margin-bottom: 16px; } .intel-nav { display: flex; gap: 10px; overflow-x: auto; padding: 10px 0; } .intel-nav-item { background: #f1f5f9; padding: 10px 18px; border-radius: 14px; font-size: 10px; font-weight: 800; white-space: nowrap; } .intel-nav-item.active { background: var(--primary); color: white; } .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; } .nav-item { text-align:center; font-size:10px; flex:1; } .tab-content { display: none; padding: 85px 15px 20px 15px; } .active-tab { display: block; } .fx-btn { padding:10px; background:#f1f5f9; border:none; border-radius:8px; font-weight:bold; font-size:10px; margin:2px; }</style></head>
<body><div class="topbar"><div onclick="toggleMenu()">☰ Pay Elite</div><div id="latencyText">PULSE: 0ms</div></div>
<div class="side-drawer" id="drawer"><b>Manager Admin</b><br><br><div onclick="switchTab('security')">Sound Engine</div></div>
<div id="tab-dash" class="tab-content active-tab"><div class="card" style="background:var(--primary);color:white;"><small>VOLUME</small><h1 id="totalRev">KES 0</h1></div><div class="card" id="activityFeed">Syncing...</div></div>
<div id="tab-security" class="tab-content"><div class="card"><h3>Audio Core</h3><div id="soundGrid"></div></div></div>
<nav class="bottom-nav"><div class="nav-item" onclick="switchTab('dash')">🏠 Dash</div><div class="nav-item" onclick="switchTab('security')">🛡️ Secure</div></nav>
<script>
const playSfx = (i) => { new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + i + ".mp3").play().catch(()=>{}); };
function toggleMenu() { document.getElementById('drawer').classList.toggle('open'); }
function switchTab(id) { document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active-tab')); document.getElementById('tab-'+id).classList.add('active-tab'); }
function buildGrid() { const g = document.getElementById('soundGrid'); for(let i=1; i<=15; i++) { g.innerHTML += '<button class="fx-btn" onclick="playSfx('+i+')">FX '+i+'</button>'; } }
async function update() { try { const r = await fetch('/api/status'); const d = await r.json(); document.getElementById('totalRev').innerText = 'KES ' + d.todayTotal.toLocaleString(); document.getElementById('latencyText').innerText = 'PULSE: ' + d.latency + 'ms'; } catch(e){} }
buildGrid(); setInterval(update, 3000); update();
</script></body></html>`); });
app.listen(process.env.PORT || 3000);
