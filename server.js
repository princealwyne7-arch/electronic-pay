const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
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
    createdAt: { type: Date, default: Date.now }
}));

const getKenyaTime = () => 
    new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Nairobi", hour: "2-digit", minute: "2-digit" });

app.get("/api/status", async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(20);
        const successfulTxs = transactions.filter(t => t.status.includes("Successful"));
        const todayTotal = successfulTxs.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
        res.json({ transactions, todayTotal, latency: Math.floor(Math.random() * 35) + 10 });
    } catch (err) { res.status(500).json({ error: "Sync Failed" }); }
});

app.post("/admin/push", async (req, res) => {
    const { phone, amount, pin } = req.body;
    if (pin !== "5566") return res.status(403).json({ error: "Access Denied", activity: "WRONG_PIN" });
    const trackingId = `BNK-${Date.now()}`;
    await new Transaction({ id: trackingId, phone, amount, status: "Processing... 🔄", time: getKenyaTime() }).save();
    try {
        await axios.post("https://paynecta.co.ke/api/v1/payment/initialize", {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { "X-API-Key": process.env.PAYNECTA_KEY, "Content-Type": "application/json" } });
        res.json({ success: true, trackingId, activity: "START_PROCESS" });
    } catch (err) { 
        await Transaction.updateOne({ id: trackingId }, { status: "Failed ❌" });
        res.status(500).json({ success: false, activity: "FAILED" });
    }
});

app.post("/callback", async (req, res) => {
    const { merchant_request_id, state, status } = req.body;
    const finalStatus = (state === "completed" || status === "success") ? "Successful ✅" : "Cancelled ⚠️";
    await Transaction.updateOne({ id: { $regex: merchant_request_id } }, { status: finalStatus });
    res.sendStatus(200);
});

app.get("/", (req, res) => {
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
        .fx-btn { padding:10px; background:#f1f5f9; border:none; border-radius:8px; font-weight:bold; font-size:10px; cursor:pointer; }
        .side-drawer { position:fixed; left:-280px; top:0; width:280px; height:100%; background:var(--primary); z-index:4000; transition:0.3s; padding:20px; box-sizing:border-box; color:white; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:2999; }
        .tab-content { display: none; padding: 85px 15px 20px 15px; }
        .active-tab { display: block; }
        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; }
        .mode-badge { position: absolute; top: 15px; right: 15px; font-size: 10px; background: var(--accent); padding: 4px 8px; border-radius: 10px; font-weight: bold; }
        .intel-nav { display: flex; gap: 10px; overflow-x: auto; padding: 5px 0 15px 0; }
        .intel-nav-item { background: #f1f5f9; padding: 10px 18px; border-radius: 14px; font-size: 10px; font-weight: 800; white-space: nowrap; }
        .intel-nav-item.active { background: var(--primary); color: white; }
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; outline:none; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; cursor:pointer; }
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; }
        .nav-item.active { color: var(--primary); }
        .vault-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; }
        .v-item { background: white; padding: 18px 10px; border-radius: 20px; border: 1px solid #f1f5f9; text-align: center; }
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
        <div class="a-grid">
            <div class="a-feat" onclick="playSfx(1)">🏦<b>Wallets</b></div>
            <div class="a-feat" onclick="playSfx(2)">📈<b>Portfolio</b></div>
            <div class="a-feat" onclick="playSfx(12)">💡<b>Analytics</b></div>
            <div class="a-feat" onclick="playSfx(15)">📥<b>Export</b></div>
        </div>
    </div>
    <div class="side-drawer" id="drawer">
        <div style="margin-bottom:30px;"><img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:50px; border-radius:50%; border:2px solid var(--accent);"><div>Admin</div></div>
        <a href="#" class="drawer-item" onclick="playSfx(2)">👤 Profile</a>
    </div>
    <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px;">
            <span onclick="toggleMenu()" style="font-size:24px; cursor:pointer;">☰</span>
            <div onclick="toggleAdminMode()" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; height:35px; border-radius:50%;">
                <span style="font-weight:800; font-size:14px;">Pay Elite</span>
            </div>
        </div>
        <div class="pulse-indicator"><div class="pulse-dot"></div><span id="latencyText">PULSE: 0ms</span></div>
    </div>
    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card"><div class="mode-badge" id="modeLabel">CLIENT</div><div style="font-size:12px; opacity:0.8;">TOTAL VOLUME</div><h1 id="totalRev">KES 0</h1></div>
        <div class="card" id="adminControl" style="display:none; border: 2px solid var(--accent);">
            <input type="password" id="adminPin" placeholder="PIN"><input type="number" id="pPhone" placeholder="254..."><input type="number" id="pAmount" placeholder="Amount"><button onclick="runPush()" class="btn-exec">AUTHORIZE</button>
        </div>
        <div class="card"><h4>Live Activity</h4><div id="activityFeed">Syncing...</div></div>
    </div>
    <div id="tab-vault" class="tab-content">
        <div class="vault-grid">
            <div class="v-item" onclick="openAssetHub()">💎 Assets</div>
            <div class="v-item" onclick="playSfx(15)">❄️ Freeze</div>
        </div>
    </div>
    <div id="tab-insights" class="tab-content">
        <div class="intel-nav"><div class="intel-nav-item active">CORE ANALYTICS</div></div>
        <div class="card"><h3>📊 Intel Engine</h3><p id="predictVal">Calculating...</p></div>
    </div>
    <div id="tab-security" class="tab-content">
        <div class="card"><h3>🛡️ SFX Diagnostics</h3>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <button class="fx-btn" onclick="playSfx(1)">FX 1</button>
                <button class="fx-btn" onclick="playSfx(2)">FX 2</button>
                <button class="fx-btn" onclick="playSfx(3)">FX 3</button>
                <button class="fx-btn" onclick="playSfx(4)">FX 4</button>
                <button class="fx-btn" onclick="playSfx(12)">FX 12</button>
            </div>
        </div>
    </div>
    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠 Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼 Vault</div>
        <div class="nav-item" onclick="switchTab('insights', this)">📊 Intel</div>
        <div class="nav-item" onclick="switchTab('security', this)">🛡️ Secure</div>
    </nav>
    <script>
        let isAdmin = false;
        let lastStatusMap = new Map();
        const playSfx = (idx) => { new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + idx + ".mp3").play().catch(()=>{}); };
        function openAssetHub() { playSfx(5); document.getElementById('assetOverlay').classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
        function closeAll() { document.getElementById('assetOverlay').classList.remove('active'); document.getElementById('drawer').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; }
        function toggleMenu() { playSfx(1); const d = document.getElementById('drawer'); d.classList.toggle('open'); document.getElementById('overlay').style.display = d.classList.contains('open') ? 'block' : 'none'; }
        function toggleAdminMode() { isAdmin = !isAdmin; playSfx(isAdmin ? 8 : 9); document.getElementById('adminControl').style.display = isAdmin ? 'block' : 'none'; document.getElementById('modeLabel').innerText = isAdmin ? 'ADMIN' : 'CLIENT'; }
        function switchTab(id, el) { playSfx(2); document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab')); document.getElementById('tab-' + id).classList.add('active-tab'); document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); el.classList.add('active'); }
        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                if (data.transactions && data.transactions.length > 0) {
                    const tx = data.transactions[0];
                    if (lastStatusMap.has(tx.id) && lastStatusMap.get(tx.id) !== tx.status) {
                        if (tx.status.includes('Successful')) playSfx(1);
                        else if (tx.status.includes('Cancelled')) playSfx(4);
                        else if (tx.status.includes('Failed')) playSfx(3);
                        else if (tx.status.includes('Processing')) playSfx(12);
                    }
                    lastStatusMap.set(tx.id, tx.status);
                }
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('latencyText').innerText = 'PULSE: ' + data.latency + 'ms';
                document.getElementById('activityFeed').innerHTML = data.transactions.map(t => '<div><b>'+t.phone+'</b><br>'+t.status+'</div>').join('');
            } catch(e) {}
        }
        setInterval(update, 3000); update();
        async function runPush() {
            const pin = document.getElementById('adminPin').value;
            const res = await fetch('/admin/push', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({pin, phone: document.getElementById('pPhone').value, amount: document.getElementById('pAmount').value}) });
            const data = await res.json();
            if (data.activity === "WRONG_PIN") playSfx(10);
            if (data.activity === "START_PROCESS") playSfx(12);
            update();
        }
    </script>
</body>
</html>
`);
});
app.listen(process.env.PORT || 3000);
