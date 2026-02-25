const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MONGODB CORE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database Linked Successfully ✅"))
    .catch(err => console.error("Database Connection Error ❌", err));

const TransactionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    phone: String,
    amount: Number,
    status: String,
    time: String,
    createdAt: { type: Date, default: Date.now }
});
const Transaction = mongoose.model("Transaction", TransactionSchema);

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

// --- SYSTEM API ROUTES ---
app.get('/api/status', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(20);
        const successfulTxs = transactions.filter(t => t.status.includes('Successful'));
        const todayTotal = successfulTxs.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
        const aiScore = Math.min(999, 800 + (successfulTxs.length * 12));
        res.json({ transactions, todayTotal, aiScore, latency: Math.floor(Math.random() * 35) + 10 });
    } catch (err) { res.status(500).json({ error: "Sync Failed" }); }
});

app.post('/admin/push', async (req, res) => {
    const { phone, amount, pin } = req.body;
    if (pin !== "5566") return res.status(403).json({ error: "Access Denied" });
    const trackingId = `BNK-${Date.now()}`;
    
    // Save to MongoDB
    await new Transaction({ 
        id: trackingId, 
        phone, 
        amount, 
        status: 'Processing... 🔄', 
        time: getKenyaTime() 
    }).save();

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

// --- CORE INTERFACE (100% ORIGINAL FEATURES) ---
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
        .intel-nav-item:active { transform: scale(0.95); }

        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; outline:none; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; cursor:pointer; }
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; }
        .nav-item.active { color: var(--primary); transform: translateY(-3px); transition: 0.2s; }
        .chart-container { height: 120px; display: flex; align-items: flex-end; gap: 4px; padding-top: 20px; }
        .chart-bar { flex: 1; background: var(--accent); border-radius: 4px 4px 0 0; transition: height 0.3s ease; }
        
        .vault-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; }
        .v-item { background: white; padding: 18px 10px; border-radius: 20px; border: 1px solid #f1f5f9; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: 0.2s; cursor: pointer; }
        .v-item:active { transform: scale(0.95); background: #f8fafc; }
        .v-icon { font-size: 22px; margin-bottom: 5px; display: block; }
        .v-label { font-size: 11px; font-weight: 800; color: #1e293b; }
        .v-sub { font-size: 9px; color: #94a3b8; font-weight: 600; }

        .intel-ticker { background: var(--primary); color: #4ade80; padding: 8px; font-family: monospace; font-size: 10px; border-radius: 12px; margin-bottom: 15px; white-space: nowrap; overflow: hidden; }
        .intel-ticker span { display: inline-block; animation: scroll 15s linear infinite; }
        @keyframes scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .node-stat { display:flex; justify-content:space-between; font-size:11px; padding:8px 0; border-bottom:1px solid #f1f5f9; }
        
        #assetOverlay { position:fixed; bottom:-100%; left:0; width:100%; height:90%; background:white; border-radius:30px 30px 0 0; z-index:3500; transition:0.4s ease; padding:25px; box-sizing:border-box; overflow-y:auto; }
        #assetOverlay.active { bottom:0; }
        .a-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-top:20px; }
        .a-feat { background:#f8fafc; padding:15px; border-radius:18px; border:1px solid #f1f5f9; }
        .a-feat b { font-size:11px; display:block; margin-top:5px; }
        .a-feat small { font-size:9px; color:var(--accent); font-weight:800; }
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
            <div style="font-size:10px; color:var(--accent)">● Market Live</div>
        </div>
        <div class="a-grid">
            <div class="a-feat" onclick="playSfx(1)">🏦<b>Wallets</b><small>Secure Storage</small></div>
            <div class="a-feat" onclick="playSfx(2)">📈<b>Portfolio</b><small>Real-time Overview</small></div>
            <div class="a-feat" onclick="playSfx(3)">💰<b>Buy / Sell</b><small>Fiat Gateway</small></div>
            <div class="a-feat" onclick="playSfx(4)">🔄<b>Swap</b><small>Instant Exchange</small></div>
            <div class="a-feat" onclick="playSfx(5)">📤<b>Send/Recv</b><small>Asset Transfer</small></div>
            <div class="a-feat" onclick="playSfx(6)">📜<b>Ledger</b><small>History Sync</small></div>
            <div class="a-feat" onclick="playSfx(7)">📊<b>Market Data</b><small>Performance</small></div>
            <div class="a-feat" onclick="playSfx(8)">🔔<b>Alerts</b><small>Price Triggers</small></div>
            <div class="a-feat" onclick="playSfx(9)">🛡️<b>Security</b><small>2FA/Biometric</small></div>
            <div class="a-feat" onclick="playSfx(10)">🖼️<b>NFTs</b><small>Token Manager</small></div>
            <div class="a-feat" onclick="playSfx(11)">🥩<b>Staking</b><small>Yield Farming</small></div>
            <div class="a-feat" onclick="playSfx(12)">💡<b>Analytics</b><small>AI Insights</small></div>
            <div class="a-feat" onclick="playSfx(13)">⚖️<b>Compliance</b><small>Regulatory/KYC</small></div>
            <div class="a-feat" onclick="playSfx(14)">🌍<b>Multi-Support</b><small>Fiat/Crypto</small></div>
            <div class="a-feat" onclick="playSfx(15)">📥<b>Export</b><small>Reports/Tax</small></div>
            <div class="a-feat" onclick="playSfx(1)">🔍<b>Search</b><small>Quick Filter</small></div>
        </div>
    </div>

    <div class="side-drawer" id="drawer">
        <div style="margin-bottom:30px;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:50px; border-radius:50%; border:2px solid var(--accent);">
            <div style="margin-top:10px; font-weight:bold;">Manager Admin</div>
            <div style="font-size:11px; color:var(--accent);">Active Engine ●</div>
        </div>
        <a href="#" class="drawer-item" onclick="playSfx(2)">👤 Profile</a>
        <a href="#" class="drawer-item" onclick="playSfx(3)">⚙️ Settings</a>
        <a href="#" class="drawer-item" onclick="playSfx(4)">🛡️ Security</a>
        <a href="#" class="drawer-item" onclick="playSfx(5)">🆔 KYC</a>
        <a href="#" class="drawer-item" onclick="playSfx(6)">🎧 Support</a>
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
            <div style="font-size:12px; opacity:0.8; font-weight:bold;">TOTAL VOLUME</div>
            <h1 id="totalRev" style="margin:8px 0; font-size:36px;">KES 0</h1>
            <div id="aiHealth" style="font-size:11px; background:rgba(255,255,255,0.1); display:inline-block; padding:5px 12px; border-radius:10px; font-weight:bold;">AI Health: --</div>
        </div>
        <div class="card" id="adminControl" style="display:none; border: 2px solid var(--accent);">
            <h3 style="margin-top:0; color:var(--accent);">Admin Command</h3>
            <input type="password" id="adminPin" placeholder="Manager Secure PIN">
            <input type="number" id="pPhone" placeholder="Recipient (254...)">
            <input type="number" id="pAmount" placeholder="Amount (KES)">
            <button onclick="runPush()" class="btn-exec">AUTHORIZE STK PUSH</button>
        </div>
        <div class="card">
            <h4 style="margin:0 0 15px 0;">Live Activity</h4>
            <div id="activityFeed" style="font-size:13px;">Syncing with Nodes...</div>
        </div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="card balance-card" style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid var(--accent);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <small style="color:var(--accent); font-weight:800;">VAULT STATUS: <span id="vLockStatus">ENCRYPTED</span></small>
                    <h2 id="vaultTotalDisplay" style="margin:5px 0; font-size:28px;">KES 0</h2>
                    <div style="font-size:10px; opacity:0.7;">Active Session: #882-ELITE</div>
                </div>
                <button onclick="emergencyLockdown()" style="background:var(--red); color:white; border:none; padding:10px; border-radius:12px; font-size:10px; font-weight:bold;">LOCKDOWN</button>
            </div>
        </div>
        <div class="vault-grid">
            <div class="v-item" onclick="playSfx(4)"><span class="v-icon">📊</span><span class="v-label">Dashboard</span><span class="v-sub">Live Assets</span></div>
            <div class="v-item" onclick="openAssetHub()"><span class="v-icon">💎</span><span class="v-label">Assets</span><span class="v-sub">Digital Hub</span></div>
            <div class="v-item" onclick="playSfx(6)"><span class="v-icon">📁</span><span class="v-label">Documents</span><span class="v-sub">IDs & Bank</span></div>
            <div class="v-item" onclick="playSfx(7)"><span class="v-icon">🔑</span><span class="v-label">Backups</span><span class="v-sub">Recovery Keys</span></div>
            <div class="v-item" onclick="playSfx(8)"><span class="v-icon">📝</span><span class="v-label">Private Notes</span><span class="v-sub">Encrypted</span></div>
            <div class="v-item" onclick="playSfx(9)"><span class="v-icon">🔒</span><span class="v-label">Secret Files</span><span class="v-sub">U-Secure</span></div>
            <div class="v-item" onclick="playSfx(10)"><span class="v-icon">🆔</span><span class="v-label">Access</span><span class="v-sub">PIN/Biometrics</span></div>
            <div class="v-item" onclick="playSfx(11)"><span class="v-icon">📡</span><span class="v-label">Monitor</span><span class="v-sub">Risk: Low</span></div>
            <div class="v-item" onclick="playSfx(12)"><span class="v-icon">⏲️</span><span class="v-label">Auto-Lock</span><span id="lockTimer" class="v-sub">14:59</span></div>
            <div class="v-item" onclick="playSfx(13)"><span class="v-icon">📜</span><span class="v-label">Activity Log</span><span class="v-sub">Full History</span></div>
            <div class="v-item" onclick="playSfx(14)"><span class="v-icon">🛡️</span><span class="v-label">Settings</span><span class="v-sub">Vault Config</span></div>
            <div class="v-item" onclick="playSfx(15)"><span class="v-icon">❄️</span><span class="v-label">Freeze</span><span class="v-sub">Node Shutdown</span></div>
        </div>
    </div>

    <div id="tab-insights" class="tab-content">
        <div class="intel-nav" id="intelNav">
            <div class="intel-nav-item active" onclick="activateIntel(this, 1)">CORE ANALYTICS</div>
            <div class="intel-nav-item" onclick="activateIntel(this, 2)">NODE TRAFFIC</div>
            <div class="intel-nav-item" onclick="activateIntel(this, 3)">AI FORECAST</div>
            <div class="intel-nav-item" onclick="activateIntel(this, 4)">GEO-SENTRY</div>
            <div class="intel-nav-item" onclick="activateIntel(this, 5)">RISK MATRIX</div>
            <div class="intel-nav-item" onclick="activateIntel(this, 6)">LEDGER AUDIT</div>
            <div class="intel-nav-item" onclick="activateIntel(this, 7)">P2P MESH</div>
        </div>

        <div class="intel-ticker">
            <span>BTC: $95,210.40 (+2.4%) | ETH: $2,550.12 (+1.5%) | SOL: $148.20 (+5.1%) | KES/USD: 129.50 | USDT: $1.00</span>
        </div>
        <div class="card" style="background:white; border-left: 5px solid var(--accent);">
            <h3 style="margin:0;">📊 Intel Engine v3.0</h3>
            <p style="font-size:11px; color:#64748b;">AI Predictive Analysis & System Node Health</p>
            <div class="chart-container" id="pulseChart"></div>
            <div style="margin-top:20px;">
                <div class="node-stat"><b>Network Protocol</b><span style="color:var(--accent)">P2P-Encrypted</span></div>
                <div class="node-stat"><b>Fraud Probability</b><span style="color:var(--accent)">0.001%</span></div>
                <div class="node-stat"><b>Next 24h Prediction</b><span id="predictVal">Calculating...</span></div>
                <div class="node-stat"><b>Node Location</b><span>Nairobi Central Hub</span></div>
                <div class="node-stat"><b>System Integrity</b><span style="color:var(--accent)">100% Secure</span></div>
                <div class="node-stat"><b>Active Channels</b><span style="color:var(--accent)">14 Nodes Online</span></div>
            </div>
        </div>
        <div class="card" style="background: linear-gradient(to right, #0f172a, #1e293b); color:white;">
            <h4 style="margin:0 0 10px 0;">⚡ Rapid Insights</h4>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:12px;">
                    <small>Success Index</small><br><b id="successRate">0%</b>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:12px;">
                    <small>System Load</small><br><b id="sysLoad">Optimal</b>
                </div>
            </div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="card">
            <h3>🛡️ Audio Core Diagnostics</h3>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                ${Array.from({length: 15}, (_, i) => `<button class="fx-btn" onclick="playSfx(${i+1})">FX ENGINE ${i+1}</button>`).join('')}
            </div>
            <button class="btn-exec" onclick="emergencyLockdown()" style="background:var(--red); margin-top:20px;">LOCK SYSTEM</button>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼<br>Vault</div>
        <div class="nav-item" onclick="switchTab('insights', this)">📊<br>Intel</div>
        <div class="nav-item" onclick="switchTab('security', this)">🛡️<br>Secure</div>
    </nav>

    <script>
        let isAdmin = false;
        const playSfx = (idx) => {
            const audio = new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + idx + ".mp3");
            audio.play().catch(() => {});
        };

        function activateIntel(el, sfx) {
            playSfx(sfx);
            document.querySelectorAll('.intel-nav-item').forEach(item => item.classList.remove('active'));
            el.classList.add('active');
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }

        function openAssetHub() { playSfx(5); document.getElementById('assetOverlay').classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
        function closeAll() { document.getElementById('assetOverlay').classList.remove('active'); document.getElementById('drawer').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; }
        function emergencyLockdown() { playSfx(10); document.getElementById('vLockStatus').innerText = "LOCKED"; document.body.style.filter = "grayscale(100%) brightness(70%)"; alert("EMERGENCY PROTOCOL ACTIVATED"); }
        function toggleMenu() { playSfx(1); const d = document.getElementById('drawer'); d.classList.toggle('open'); document.getElementById('overlay').style.display = d.classList.contains('open') ? 'block' : 'none'; }
        function toggleAdminMode() { isAdmin = !isAdmin; playSfx(isAdmin ? 8 : 9); document.getElementById('adminControl').style.display = isAdmin ? 'block' : 'none'; document.getElementById('modeLabel').innerText = isAdmin ? 'ADMIN' : 'CLIENT'; document.getElementById('modeLabel').style.background = isAdmin ? 'var(--red)' : 'var(--accent)'; }
        function switchTab(id, el) { playSfx(2); document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab')); document.getElementById('tab-' + id).classList.add('active-tab'); document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); el.classList.add('active'); }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('vaultTotalDisplay').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('assetBTC').innerText = (data.todayTotal / 12450000).toFixed(6) + ' BTC';
                document.getElementById('latencyText').innerText = 'PULSE: ' + data.latency + 'ms';
                const successfulCount = data.transactions.filter(t => t.status.includes('Successful')).length;
                const rate = data.transactions.length ? Math.round((successfulCount / data.transactions.length) * 100) : 0;
                document.getElementById('successRate').innerText = rate + '%';
                document.getElementById('sysLoad').innerText = data.latency > 30 ? 'High' : 'Optimal';
                document.getElementById('predictVal').innerText = 'KES ' + Math.floor(data.todayTotal * 1.18).toLocaleString();
                const pulseHue = 140 - data.latency;
                document.documentElement.style.setProperty('--accent', \`hsl(\${pulseHue}, 60%, 40%)\`);
                const chart = document.getElementById('pulseChart');
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                bar.style.height = (data.latency * 2) + 'px';
                if(chart.children.length > 20) chart.removeChild(chart.firstChild);
                chart.appendChild(bar);
                document.getElementById('activityFeed').innerHTML = data.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9;">
                        <span><b>\${t.phone}</b><br><small>\${t.time}</small></span>
                        <span style="text-align:right;"><b style="color:var(--accent)">KES \${t.amount}</b><br>
                        <small style="font-weight:bold;">\${t.status}</small></span>
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine active on port ${PORT}`));
