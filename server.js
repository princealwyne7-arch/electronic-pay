const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const logic = require("./engines/logic_engine");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database Linked ✅"))
    .catch(err => console.error("DB Error:", err));

const Transaction = mongoose.model("Transaction", new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    phone: String,
    amount: Number,
    status: String,
    time: String,
    type: { type: String, default: 'STK_PUSH' },
    createdAt: { type: Date, default: Date.now }
}));

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.post('/api/transfer', async (req, res) => {
    const result = logic.processTransfer(req.body);
    res.json(result);
});

app.get('/api/status', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(20);
        const successfulTxs = transactions.filter(t => t.status.includes('Successful'));
        const todayTotal = successfulTxs.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
        const aiHealth = logic.calculateAiHealth(transactions);
        res.json({ transactions, todayTotal, aiHealth, latency: Math.floor(Math.random() * 35) + 10 });
    } catch (err) { res.status(500).json({ error: "Sync Failed" }); }
});

app.post('/admin/push', async (req, res) => {
    const { phone, amount, pin } = req.body;
    if (pin !== "5566") return res.status(403).json({ error: "Access Denied" });
    const trackingId = `BNK-${Date.now()}`;
    await new Transaction({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() }).save();
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        res.json({ success: true, trackingId });
    } catch (err) { 
        await Transaction.updateOne({ id: trackingId }, { status: "Failed ❌" });
        res.status(500).json({ success: false });
    }
});

app.post('/callback', async (req, res) => {
    const { merchant_request_id, state, status } = req.body;
    const finalStatus = (state === 'completed' || status === 'success') ? "Successful ✅" : "Cancelled ⚠️";
    await Transaction.updateOne({ id: { $regex: merchant_request_id } }, { status: finalStatus });
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay | Elite Banking</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; overflow-x: hidden; transition: background 0.4s ease; }
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .pulse-indicator { font-size: 9px; color: #94a3b8; display: flex; align-items: center; gap: 4px; font-weight: 800; }
        .pulse-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .fx-btn { padding:10px; background:#f1f5f9; border:none; border-radius:8px; font-weight:bold; font-size:10px; cursor:pointer; transition: 0.2s; border: 1px solid transparent; }
        .fx-btn:active { transform: scale(0.92); background: var(--accent); color: white; box-shadow: 0 0 10px var(--accent); }
        .side-drawer { position:fixed; left:-280px; top:0; width:280px; height:100%; background:var(--primary); z-index:4000; transition:0.3s cubic-bezier(0.4, 0, 0.2, 1); padding:20px; box-sizing:border-box; color:white; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:2999; backdrop-filter: blur(2px); }
        .drawer-item { padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); color:white; text-decoration:none; display:block; font-size:14px; }
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s ease; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; } }
        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; overflow: hidden; }
        .mode-badge { position: absolute; top: 15px; right: 15px; font-size: 10px; background: var(--accent); padding: 4px 8px; border-radius: 10px; font-weight: bold; }
        .intel-nav { display: flex; gap: 10px; overflow-x: auto; padding: 5px 0 15px 0; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .intel-nav::-webkit-scrollbar { display: none; }
        .intel-nav-item { position: relative; background: #f1f5f9; padding: 10px 18px; border-radius: 14px; font-size: 10px; font-weight: 800; white-space: nowrap; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
        .intel-nav-item.active { background: var(--primary); color: white; border-color: var(--primary); transform: scale(1.05); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; outline:none; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; cursor:pointer; }
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; }
        .nav-item.active { color: var(--primary); transform: translateY(-3px); transition: 0.2s; }
        .chart-container { height: 120px; display: flex; align-items: flex-end; gap: 4px; padding-top: 20px; }
        .chart-bar { flex: 1; background: var(--accent); border-radius: 4px 4px 0 0; transition: height 0.3s ease; }
        .vault-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; }
        .v-item { background: white; padding: 18px 10px; border-radius: 20px; border: 1px solid #f1f5f9; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: 0.2s; cursor: pointer; }
        .intel-ticker { background: var(--primary); color: #4ade80; padding: 8px; font-family: monospace; font-size: 10px; border-radius: 12px; margin-bottom: 15px; white-space: nowrap; overflow: hidden; }
        .intel-ticker span { display: inline-block; animation: scroll 15s linear infinite; }
        @keyframes scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .node-stat { display:flex; justify-content:space-between; font-size:11px; padding:8px 0; border-bottom:1px solid #f1f5f9; }
        #assetOverlay { position:fixed; bottom:-100%; left:0; width:100%; height:90%; background:white; border-radius:30px 30px 0 0; z-index:3500; transition:0.4s ease; padding:25px; box-sizing:border-box; overflow-y:auto; }
        #assetOverlay.active { bottom:0; }
        .a-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-top:20px; }
        .a-feat { background:#f8fafc; padding:15px; border-radius:18px; border:1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="closeAll()"></div>
    <div id="assetOverlay">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0;">Digital Assets</h2>
            <button onclick="closeAll()" style="background:#f1f5f9; border:none; border-radius:50%; width:35px; height:35px; font-weight:bold;">✕</button>
        </div>
        <div class="card" style="background:var(--primary); color:white; margin-top:20px;">
            <small style="opacity:0.7">ESTIMATED BALANCE</small>
            <h2 id="assetBTC" style="margin:5px 0;">0.000000 BTC</h2>
        </div>
        <div class="a-grid">
            ${Array.from({length: 15}, (_, i) => `<div class="a-feat" onclick="playSfx(${i+1})"><b>Feature ${i+1}</b><small>Active Node</small></div>`).join('')}
        </div>
    </div>
    <div class="side-drawer" id="drawer">
        <div style="margin-bottom:30px;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:50px; border-radius:50%; border:2px solid var(--accent);">
            <div style="margin-top:10px; font-weight:bold;">Manager Admin</div>
        </div>
        <a href="#" class="drawer-item" onclick="playSfx(2)">👤 Profile</a>
    </div>
    <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px;">
            <span onclick="toggleMenu()" style="font-size:24px; cursor:pointer;">☰</span>
            <div id="adminToggle" onclick="toggleAdminMode()" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; height:35px; border-radius:50%; border:2px solid var(--accent);">
                <span style="font-weight:800; font-size:14px;">Pay <span style="color:var(--accent)">Elite</span></span>
            </div>
        </div>
        <div class="pulse-indicator"><div class="pulse-dot"></div><span id="latencyText">PULSE: 0ms</span></div>
    </div>
    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div class="mode-badge" id="modeLabel">CLIENT</div>
            <h1 id="totalRev" style="margin:8px 0; font-size:36px;">KES 0</h1>
            <div id="aiHealth" style="font-size:11px; background:rgba(255,255,255,0.1); padding:5px 12px; border-radius:10px; font-weight:bold;">AI Health: --</div>
        </div>
        <div class="card" id="adminControl" style="display:none; border: 2px solid var(--accent);">
            <input type="password" id="adminPin" placeholder="PIN">
            <input type="number" id="pPhone" placeholder="Phone">
            <input type="number" id="pAmount" placeholder="Amount">
            <button onclick="runPush()" class="btn-exec">AUTHORIZE</button>
        </div>
        <div class="card">
            <div id="activityFeed" style="font-size:13px;">Syncing...</div>
        </div>
    </div>
    <div id="tab-vault" class="tab-content">
        <div class="card balance-card">
            <h2 id="vaultTotalDisplay">KES 0</h2>
        </div>
        <div class="vault-grid">
            ${Array.from({length: 12}, (_, i) => `<div class="v-item" onclick="playSfx(${i+1})">Vault Node ${i+1}</div>`).join('')}
        </div>
    </div>
    <div id="tab-security" class="tab-content">
        <div class="card">
            <h3>🛡️ Audio Core (15 FX)</h3>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                ${Array.from({length: 15}, (_, i) => `<button class="fx-btn" onclick="playSfx(${i+1})">FX ${i+1}</button>`).join('')}
            </div>
        </div>
    </div>
    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼<br>Vault</div>
        <div class="nav-item" onclick="switchTab('security', this)">🛡️<br>Secure</div>
    </nav>
    <script>
        let isAdmin = false;
        const playSfx = (idx) => {
            const audio = new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + idx + ".mp3");
            audio.play().catch(() => {});
        };
        function toggleMenu() { playSfx(1); const d = document.getElementById('drawer'); d.classList.toggle('open'); }
        function toggleAdminMode() { isAdmin = !isAdmin; document.getElementById('adminControl').style.display = isAdmin ? 'block' : 'none'; }
        function switchTab(id, el) { playSfx(2); document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab')); document.getElementById('tab-' + id).classList.add('active-tab'); }
        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('aiHealth').innerText = 'AI Health: ' + data.aiHealth;
                document.getElementById('latencyText').innerText = 'PULSE: ' + data.latency + 'ms';
            } catch(e) {}
        }
        setInterval(update, 3000); update();
        async function runPush() { 
            const pin = document.getElementById('adminPin').value;
            const phone = document.getElementById('pPhone').value;
            const amount = document.getElementById('pAmount').value;
            await fetch('/admin/push', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({pin, phone, amount}) });
        }
    </script>
</body>
</html>
`);
});
app.listen(process.env.PORT || 3000);
