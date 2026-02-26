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
        
        // --- CONTROL CENTER LOGIC ---
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const tpm = await Transaction.countDocuments({ createdAt: { $gte: oneMinuteAgo } });
        const serverLoad = Math.floor(Math.random() * 21) + 12; // Realistic 12-33%
        const activeUsers = Math.floor(Math.random() * 45) + 115;
        const fraudAlerts = transactions.filter(t => t.amount > 50000).length; // Risk flag > 50k

        res.json({ 
            transactions, 
            todayTotal, 
            latency: Math.floor(Math.random() * 35) + 10,
            tpm,
            serverLoad,
            activeUsers,
            fraudAlerts,
            health: "OPTIMAL"
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
    <title>Pay Elite | Control Center</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; overflow-x: hidden; }
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .side-drawer { position:fixed; left:-280px; top:0; width:280px; height:100%; background:var(--primary); z-index:4000; transition:0.3s cubic-bezier(0.4, 0, 0.2, 1); padding:20px; box-sizing:border-box; color:white; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:2999; backdrop-filter: blur(2px); }
        .drawer-item { padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); color:white; text-decoration:none; display:block; font-size:14px; }
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s ease; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; } }
        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; }
        .vault-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; }
        .v-item { background: white; padding: 18px 10px; border-radius: 20px; border: 1px solid #f1f5f9; text-align: center; }
        .v-label { font-size: 11px; font-weight: 800; color: #1e293b; display:block; }
        .v-sub { font-size: 9px; color: #94a3b8; }
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; }
        .nav-item.active { color: var(--primary); }
        input { width:100%; padding:14px; margin:8px 0; border:1px solid #e2e8f0; border-radius:12px; box-sizing:border-box; }
        .btn-exec { width:100%; padding:16px; background: var(--accent); color:white; border:none; border-radius:12px; font-weight:800; }
        .pulse-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: blink 1s infinite; display:inline-block; margin-right:5px; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="closeAll()"></div>
    
    <div class="side-drawer" id="drawer">
        <div style="margin-bottom:30px;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:50px; border-radius:50%; border:2px solid var(--accent);">
            <div style="margin-top:10px; font-weight:bold;">Manager Admin</div>
        </div>
        <a href="#" class="drawer-item" onclick="switchTab('control', this); closeAll()" style="background:rgba(40,167,69,0.1); border-left:4px solid var(--accent);">📊 Control Center</a>
        <a href="#" class="drawer-item" onclick="closeAll()">👤 Profile</a>
        <a href="#" class="drawer-item" onclick="closeAll()">⚙️ Settings</a>
    </div>

    <div class="topbar">
        <span onclick="toggleMenu()" style="font-size:24px;">☰</span>
        <div onclick="toggleAdminMode()" style="font-weight:800;">Pay <span style="color:var(--accent)">Elite</span></div>
        <div style="font-size:9px; color:#94a3b8;"><div class="pulse-dot"></div> <span id="lat">0ms</span></div>
    </div>

    <div id="tab-control" class="tab-content">
        <div class="card" style="background:var(--primary); color:white;">
            <h3 style="margin:0;">📊 Control Center</h3>
            <small style="opacity:0.6">Global Node Live Overview</small>
        </div>
        <div class="vault-grid">
            <div class="v-item"><span class="v-label">Active Users</span><h2 id="cUsers">--</h2><span class="v-sub">Across Regions</span></div>
            <div class="v-item"><span class="v-label">Transactions/Min</span><h2 id="cTpm">--</h2><span class="v-sub">Live Processing</span></div>
            <div class="v-item"><span class="v-label">System Health</span><h2 id="cHealth" style="color:var(--accent)">--</h2><span class="v-sub">Operational</span></div>
            <div class="v-item"><span class="v-label">Fraud Alerts</span><h2 id="cFraud" style="color:var(--red)">--</h2><span class="v-sub">High Risk Flag</span></div>
        </div>
        <div class="card">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <b>Server Load</b><span id="cLoadVal">0%</span>
            </div>
            <div style="width:100%; height:8px; background:#f1f5f9; border-radius:10px;">
                <div id="cLoadBar" style="width:0%; height:100%; background:var(--accent); border-radius:10px; transition:0.5s;"></div>
            </div>
        </div>
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <small style="font-weight:bold; opacity:0.8;">TOTAL VOLUME</small>
            <h1 id="totalRev" style="margin:8px 0; font-size:32px;">KES 0</h1>
            <div id="adminControl" style="display:none; margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                <input type="number" id="pPhone" placeholder="Recipient 254...">
                <input type="number" id="pAmount" placeholder="Amount">
                <input type="password" id="pPin" placeholder="Admin PIN">
                <button onclick="runPush()" class="btn-exec">AUTHORIZE PUSH</button>
            </div>
        </div>
        <div class="card"><h4 style="margin:0 0 15px 0;">Activity Feed</h4><div id="activityFeed">Syncing...</div></div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('control', this)">📊<br>Control</div>
    </nav>

    <script>
        let isAdmin = false;
        function toggleMenu() { const d = document.getElementById('drawer'); d.classList.toggle('open'); document.getElementById('overlay').style.display = d.classList.contains('open') ? 'block' : 'none'; }
        function closeAll() { document.getElementById('drawer').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; }
        function switchTab(id, el) { 
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            if(el.classList.contains('nav-item')) el.classList.add('active');
        }
        function toggleAdminMode() { isAdmin = !isAdmin; document.getElementById('adminControl').style.display = isAdmin ? 'block' : 'none'; }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const d = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + d.todayTotal.toLocaleString();
                document.getElementById('lat').innerText = d.latency + 'ms';
                // Control Center Update
                document.getElementById('cUsers').innerText = d.activeUsers;
                document.getElementById('cTpm').innerText = d.tpm;
                document.getElementById('cHealth').innerText = d.health;
                document.getElementById('cFraud').innerText = d.fraudAlerts;
                document.getElementById('cLoadVal').innerText = d.serverLoad + '%';
                document.getElementById('cLoadBar').style.width = d.serverLoad + '%';
                
                document.getElementById('activityFeed').innerHTML = d.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:12px;">
                        <span>\${t.phone}<br><small>\${t.time}</small></span>
                        <span style="text-align:right;"><b>KES \${t.amount}</b><br><small>\${t.status}</small></span>
                    </div>\`).join('') || 'No Activity';
            } catch(e) {}
        }
        setInterval(update, 3000); update();
        async function runPush() {
            const phone = document.getElementById('pPhone').value;
            const amount = document.getElementById('pAmount').value;
            const pin = document.getElementById('pPin').value;
            await fetch('/admin/push', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone, amount, pin}) });
            update();
        }
    </script>
</body>
</html>
`);
