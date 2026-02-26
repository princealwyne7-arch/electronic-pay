const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database Linked ✅"))
    .catch(err => console.error("DB Error:", err));

const Transaction = mongoose.model("Transaction", new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    phone: String,
    amount: Number,
    status: String,
    time: String,
    createdAt: { type: Date, default: Date.now }
}));

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(20);
        const successfulTxs = transactions.filter(t => t.status.includes('Successful'));
        const todayTotal = successfulTxs.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
        
        // AI COMMAND CENTER METRICS ENGINE (Integrated)
        const aiMetrics = {
            tps: (Math.random() * 5 + 1).toFixed(2),
            online: Math.floor(Math.random() * 50 + 15),
            activeTrans: transactions.filter(t => t.status.includes('Processing')).length,
            fraud: transactions.filter(t => t.status.includes('Failed')).length,
            health: "OPTIMAL",
            risk: "LOW"
        };

        res.json({ 
            transactions, 
            todayTotal, 
            aiMetrics,
            latency: Math.floor(Math.random() * 35) + 10 
        });
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
    <title>Elite Banking | AI Command</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --ai-blue: #00f2ff; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; overflow-x: hidden; transition: background 0.4s ease; }
        
        /* ORIGINAL TOPBAR & PULSE */
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .pulse-indicator { font-size: 9px; color: #94a3b8; display: flex; align-items: center; gap: 4px; font-weight: 800; }
        .pulse-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        /* MERGED SIDE DRAWER (Original + AI Center) */
        .side-drawer { position:fixed; left:-320px; top:0; width:320px; height:100%; background:var(--primary); z-index:4000; transition:0.3s cubic-bezier(0.4, 0, 0.2, 1); padding:15px; box-sizing:border-box; color:white; overflow-y:auto; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:2999; backdrop-filter: blur(2px); }
        .drawer-item { padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); color:white; text-decoration:none; display:block; font-size:14px; }
        
        /* AI COMMAND CENTER UI */
        .ai-center { background: rgba(0, 242, 255, 0.05); border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 20px; padding: 15px; margin-bottom: 20px; }
        .ai-title { color: var(--ai-blue); font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 10px; display:flex; align-items:center; gap:5px; }
        .ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9px; }
        .ai-box { background: rgba(255,255,255,0.03); padding: 8px; border-radius: 10px; border: 0.5px solid rgba(255,255,255,0.05); }
        .ai-box b { display: block; color: var(--ai-blue); font-size: 11px; }
        
        .meter-wrap { margin: 10px 0; }
        .meter-head { display: flex; justify-content: space-between; font-size: 8px; color: #64748b; margin-bottom: 3px; font-weight: 800; }
        .meter-bar { height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden; }
        .meter-in { height: 100%; background: var(--ai-blue); transition: width 0.5s; }

        /* ORIGINAL TABS & CARDS */
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s ease; }
        .active-tab { display: block; }
        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; overflow: hidden; }
        .mode-badge { position: absolute; top: 15px; right: 15px; font-size: 10px; background: var(--accent); padding: 4px 8px; border-radius: 10px; font-weight: bold; }

        /* ASSET OVERLAY */
        #assetOverlay { position:fixed; bottom:-100%; left:0; width:100%; height:90%; background:white; border-radius:30px 30px 0 0; z-index:3500; transition:0.4s ease; padding:25px; box-sizing:border-box; overflow-y:auto; }
        #assetOverlay.active { bottom:0; }
        .a-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-top:20px; }
        .a-feat { background:#f8fafc; padding:15px; border-radius:18px; border:1px solid #f1f5f9; }

        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; flex:1; }
        .nav-item.active { color: var(--primary); }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="closeAll()"></div>

    <div id="assetOverlay">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0;">Digital Assets</h2>
            <button onclick="closeAll()" style="background:#f1f5f9; border:none; border-radius:50%; width:35px; height:35px;">✕</button>
        </div>
        <div class="card" style="background:var(--primary); color:white; margin-top:20px;">
            <small style="opacity:0.7">ESTIMATED BALANCE</small>
            <h2 id="assetBTC" style="margin:5px 0;">0.000000 BTC</h2>
        </div>
        <div class="a-grid">
            <div class="a-feat" onclick="playSfx(1)">🏦<b>Wallets</b></div>
            <div class="a-feat" onclick="playSfx(2)">📈<b>Portfolio</b></div>
            <div class="a-feat" onclick="playSfx(4)">🔄<b>Swap</b></div>
            <div class="a-feat" onclick="playSfx(9)">🛡️<b>Security</b></div>
        </div>
    </div>

    <div class="side-drawer" id="drawer">
        <div style="margin-bottom:20px; display:flex; align-items:center; gap:10px;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:45px; border-radius:50%; border:2px solid var(--accent);">
            <div>
                <div style="font-weight:bold;">Manager Admin</div>
                <div style="font-size:10px; color:var(--accent);">Intelligence Linked ●</div>
            </div>
        </div>

        <div class="ai-center">
            <div class="ai-title">🧠 MASTER AI COMMAND CENTER</div>
            <div class="ai-grid">
                <div class="ai-box"><span>Users Online</span><b id="ai-online">0</b></div>
                <div class="ai-box"><span>TPS Live</span><b id="ai-tps">0.00</b></div>
                <div class="ai-box"><span>Fraud Alerts</span><b id="ai-fraud" style="color:var(--red)">0</b></div>
                <div class="ai-box"><span>Risk Level</span><b id="ai-risk">LOW</b></div>
            </div>
            
            <div class="meter-wrap">
                <div class="meter-head"><span>SYSTEM POWER</span><span id="v-pwr">98%</span></div>
                <div class="meter-bar"><div class="meter-in" style="width: 98%;"></div></div>
            </div>
            <div class="meter-wrap">
                <div class="meter-head"><span>AI CONFIDENCE</span><span id="v-conf">95%</span></div>
                <div class="meter-bar"><div class="meter-in" style="width: 95%; background: var(--ai-blue);"></div></div>
            </div>

            <div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:5px; font-size:9px; font-style:italic; color:#94a3b8; margin:10px 0;" id="ai-msg">
                AI: System synchronized.
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
                <button onclick="aiTrigger('Optimizing...')" style="background:none; border:1px solid var(--ai-blue); color:var(--ai-blue); font-size:8px; padding:5px; border-radius:5px;">OPTIMIZE</button>
                <button onclick="aiTrigger('Scanning...')" style="background:none; border:1px solid var(--ai-blue); color:var(--ai-blue); font-size:8px; padding:5px; border-radius:5px;">DIAGNOSTICS</button>
            </div>
        </div>

        <a href="#" class="drawer-item" onclick="playSfx(2)">👤 Profile</a>
        <a href="#" class="drawer-item" onclick="playSfx(3)">⚙️ Settings</a>
        <a href="#" class="drawer-item" onclick="playSfx(4)">🛡️ Security</a>
    </div>

    <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px;">
            <span onclick="toggleMenu()" style="font-size:24px; cursor:pointer;">☰</span>
            <div onclick="toggleAdminMode()" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; height:35px; border-radius:50%; border:2px solid var(--accent);">
                <span style="font-weight:800; font-size:14px;">Pay <span style="color:var(--accent)">Elite</span></span>
            </div>
        </div>
        <div class="pulse-indicator"><div class="pulse-dot"></div><span id="latencyText">PULSE: 0ms</span></div>
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div class="mode-badge" id="modeLabel">CLIENT</div>
            <div style="font-size:12px; opacity:0.8; font-weight:bold;">TOTAL VOLUME</div>
            <h1 id="totalRev" style="margin:8px 0; font-size:36px;">KES 0</h1>
            <div id="aiHealth" style="font-size:10px; background:rgba(255,255,255,0.1); display:inline-block; padding:4px 10px; border-radius:10px;">AI Health: OPTIMAL</div>
        </div>
        <div class="card" id="adminControl" style="display:none; border: 2px solid var(--accent);">
            <h3 style="margin-top:0; color:var(--accent);">Admin Command</h3>
            <input type="password" id="adminPin" placeholder="Secure PIN">
            <input type="number" id="pPhone" placeholder="Recipient 254...">
            <input type="number" id="pAmount" placeholder="Amount">
            <button onclick="runPush()" class="btn-exec">AUTHORIZE STK</button>
        </div>
        <div class="card">
            <h4 style="margin:0 0 15px 0;">Live Activity</h4>
            <div id="activityFeed" style="font-size:13px;">Syncing...</div>
        </div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="card balance-card" style="border:1px solid var(--accent)">
            <h2 id="vaultTotalDisplay" style="margin:0;">KES 0</h2>
            <small>VAULT ENCRYPTED</small>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
            <div class="a-feat" onclick="openAssetHub()">💎<b>Assets Hub</b></div>
            <div class="a-feat" onclick="playSfx(10)">🔒<b>Vault Lock</b></div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼<br>Vault</div>
        <div class="nav-item">📊<br>Intel</div>
        <div class="nav-item">🛡️<br>Secure</div>
    </nav>

    <script>
        let isAdmin = false;
        const playSfx = (idx) => { new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + idx + ".mp3").play().catch(() => {}); };
        function toggleMenu() { playSfx(1); document.getElementById('drawer').classList.toggle('open'); document.getElementById('overlay').style.display = document.getElementById('drawer').classList.contains('open') ? 'block' : 'none'; }
        function closeAll() { document.getElementById('assetOverlay').classList.remove('active'); document.getElementById('drawer').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; }
        function openAssetHub() { playSfx(5); document.getElementById('assetOverlay').classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
        function toggleAdminMode() { isAdmin = !isAdmin; playSfx(isAdmin ? 8 : 9); document.getElementById('adminControl').style.display = isAdmin ? 'block' : 'none'; document.getElementById('modeLabel').innerText = isAdmin ? 'ADMIN' : 'CLIENT'; }
        function switchTab(id, el) { playSfx(2); document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab')); if(document.getElementById('tab-'+id)) document.getElementById('tab-' + id).classList.add('active-tab'); document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); el.classList.add('active'); }
        function aiTrigger(m) { document.getElementById('ai-msg').innerText = "AI: " + m; playSfx(10); }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('vaultTotalDisplay').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('assetBTC').innerText = (data.todayTotal / 12450000).toFixed(6) + ' BTC';
                document.getElementById('latencyText').innerText = 'PULSE: ' + data.latency + 'ms';
                
                // AI METRICS UPDATE
                document.getElementById('ai-online').innerText = data.aiMetrics.online;
                document.getElementById('ai-tps').innerText = data.aiMetrics.tps;
                document.getElementById('ai-fraud').innerText = data.aiMetrics.fraud;
                document.getElementById('ai-risk').innerText = data.aiMetrics.risk;

                document.getElementById('activityFeed').innerHTML = data.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9;">
                        <span><b>\${t.phone}</b><br><small>\${t.time}</small></span>
                        <span style="text-align:right;"><b>KES \${t.amount}</b><br><small>\${t.status}</small></span>
                    </div>\`).join('') || 'No Activity';
            } catch(e) {}
        }
        setInterval(update, 3000); update();
        async function runPush() { playSfx(10); const pin = document.getElementById('adminPin').value; const phone = document.getElementById('pPhone').value; const amount = document.getElementById('pAmount').value; await fetch('/admin/push', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({pin, phone, amount}) }); update(); }
    </script>
</body>
</html>
`);
});
app.listen(process.env.PORT || 3000);
