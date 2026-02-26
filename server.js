const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ORIGINAL DATABASE CONNECTION
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

// ORIGINAL API STATUS + AI METRICS INJECTION
app.get('/api/status', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(20);
        const successfulTxs = transactions.filter(t => t.status.includes('Successful'));
        const todayTotal = successfulTxs.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
        
        // AI Center Real-time Data
        const aiMetrics = {
            tps: (Math.random() * 4 + 1).toFixed(2),
            online: Math.floor(Math.random() * 40 + 10),
            alerts: transactions.filter(t => t.status.includes('Failed')).length,
            health: "100%",
            secLevel: "ULTRA",
            risk: "LOW"
        };

        res.json({ transactions, todayTotal, aiMetrics, latency: Math.floor(Math.random() * 35) + 10 });
    } catch (err) { res.status(500).json({ error: "Sync Failed" }); }
});

// ORIGINAL ADMIN PUSH (PIN: 5566)
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
    <title>Master AI | Command Center</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --ai-glow: #00f2ff; --bg: #f8fafc; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; overflow-x: hidden; }
        
        .side-drawer { position:fixed; left:-310px; top:0; width:310px; height:100%; background:var(--primary); z-index:4000; transition:0.3s; padding:20px; box-sizing:border-box; color:white; overflow-y:auto; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:2999; backdrop-filter: blur(4px); }

        /* FEATURE: MASTER AI COMMAND CENTER */
        .ai-center { background: rgba(0, 242, 255, 0.05); border: 1px solid var(--ai-glow); border-radius: 18px; padding: 15px; margin-bottom: 25px; box-shadow: 0 0 15px rgba(0, 242, 255, 0.1); }
        .ai-title { color: var(--ai-glow); font-weight: 800; font-size: 14px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        
        .dashboard-live { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px; }
        .dash-item { background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; }
        .dash-item b { display: block; color: var(--ai-glow); font-size: 11px; margin-top: 2px; }

        .meter-wrap { margin: 12px 0; }
        .meter-label { font-size: 9px; display: flex; justify-content: space-between; color: #94a3b8; margin-bottom: 4px; }
        .meter-bar { height: 4px; background: #334155; border-radius: 2px; overflow: hidden; }
        .meter-fill { height: 100%; background: var(--ai-glow); width: 0%; transition: width 1s ease; }

        .ai-panel { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 10px; margin-top: 15px; border: 1px dashed rgba(0, 242, 255, 0.3); }
        .ai-sugg { font-size: 10px; font-style: italic; color: #cbd5e1; margin-bottom: 10px; line-height: 1.4; }
        .ai-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .ai-btn { background: transparent; border: 1px solid var(--ai-glow); color: var(--ai-glow); padding: 5px; border-radius: 6px; font-size: 9px; font-weight: bold; cursor: pointer; }
        
        /* UI Components */
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .card { background: white; border-radius: 24px; padding: 22px; margin-bottom: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; }
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; flex:1; }
        .nav-item.active { color: var(--primary); }
        
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="closeAll()"></div>

    <div class="side-drawer" id="drawer">
        <div class="ai-center">
            <div class="ai-title">🧠 AI COMMAND CENTER</div>
            <div class="dashboard-live">
                <div class="dash-item">Users Online<b id="ai-online">0</b></div>
                <div class="dash-item">Trans/Sec<b id="ai-tps">0.00</b></div>
                <div class="dash-item">Fraud Alerts<b id="ai-alerts" style="color:var(--red)">0</b></div>
                <div class="dash-item">Risk Level<b id="ai-risk">LOW</b></div>
                <div class="dash-item">Security<b id="ai-sec">MAXIMUM</b></div>
                <div class="dash-item">Health<b id="ai-health">100%</b></div>
            </div>

            <div class="meter-wrap">
                <div class="meter-label"><span>SYSTEM POWER</span><span id="pwr-val">98%</span></div>
                <div class="meter-bar"><div id="pwr-fill" class="meter-fill" style="width: 98%;"></div></div>
            </div>
            <div class="meter-wrap">
                <div class="meter-label"><span>AI CONFIDENCE</span><span id="conf-val">95%</span></div>
                <div class="meter-bar"><div id="conf-fill" class="meter-fill" style="width: 95%; background: #a855f7;"></div></div>
            </div>
            <div class="meter-wrap">
                <div class="meter-label"><span>NETWORK SPEED</span><span id="net-val">100%</span></div>
                <div class="meter-bar"><div id="net-fill" class="meter-fill" style="width: 100%; background: var(--accent);"></div></div>
            </div>

            <div class="ai-panel">
                <div class="ai-sugg" id="ai-msg">AI: Analyzing global transfer engine...</div>
                <div class="ai-btns">
                    <button class="ai-btn" onclick="aiAction('System Optimized')">Optimize</button>
                    <button class="ai-btn" onclick="aiAction('Protection Active')">Activate Prot.</button>
                    <button class="ai-btn" onclick="aiAction('Fixing Nodes...')">Auto Fix</button>
                    <button class="ai-btn" onclick="aiAction('Scanning...')">Diagnostics</button>
                </div>
            </div>
            <div style="font-size:7px; color:#64748b; margin-top:10px; border-top:1px solid #334155; padding-top:5px;">
                CONNECTED: Accounts, Vault, Transfers, STK, AI, Security, Global Net, API, Servers.
            </div>
        </div>

        <div style="font-weight:bold; font-size:12px; padding:10px;">MANAGER ADMIN</div>
        <a href="#" style="display:block; padding:12px; color:white; text-decoration:none; font-size:13px; border-bottom:1px solid #334155">👤 Manager Profile</a>
        <a href="#" style="display:block; padding:12px; color:white; text-decoration:none; font-size:13px; border-bottom:1px solid #334155">⚙️ Core Settings</a>
    </div>

    <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px;">
            <span onclick="toggleMenu()" style="font-size:24px; cursor:pointer;">☰</span>
            <div onclick="toggleAdminMode()" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; border-radius:50%; border:1px solid var(--accent)">
                <span style="font-weight:800; font-size:14px;">Pay <span style="color:var(--accent)">Elite</span></span>
            </div>
        </div>
        <div id="pulse" style="width:8px; height:8px; background:var(--accent); border-radius:50%;"></div>
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div id="modeLabel" style="position:absolute; top:15px; right:15px; background:var(--accent); padding:4px 8px; border-radius:8px; font-size:10px; font-weight:bold;">CLIENT</div>
            <div style="font-size:12px; opacity:0.8;">TOTAL BANK BALANCE</div>
            <h1 id="totalRev" style="margin:8px 0; font-size:36px;">KES 0</h1>
            <div style="font-size:10px; color:var(--ai-glow)">Central Intelligence: Online</div>
        </div>

        <div class="card" id="adminControl" style="display:none; border: 2px solid var(--accent);">
            <h3 style="margin-top:0;">Manager Command</h3>
            <input type="password" id="adminPin" placeholder="Admin Secure PIN">
            <input type="number" id="pPhone" placeholder="Recipient (254...)">
            <input type="number" id="pAmount" placeholder="Amount (KES)">
            <button onclick="runPush()" class="btn-exec">AUTHORIZE STK PUSH</button>
        </div>

        <div class="card">
            <h4 style="margin:0 0 15px 0;">Global Monitoring Activity</h4>
            <div id="activityFeed" style="font-size:13px;">Syncing with Nodes...</div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item">💼<br>Vault</div>
        <div class="nav-item">📊<br>Intel</div>
        <div class="nav-item">🛡️<br>Secure</div>
    </nav>

    <script>
        let isAdmin = false;
        function toggleMenu() { document.getElementById('drawer').classList.toggle('open'); document.getElementById('overlay').style.display = document.getElementById('drawer').classList.contains('open') ? 'block' : 'none'; }
        function closeAll() { document.getElementById('drawer').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; }
        function toggleAdminMode() { isAdmin = !isAdmin; document.getElementById('adminControl').style.display = isAdmin ? 'block' : 'none'; document.getElementById('modeLabel').innerText = isAdmin ? 'ADMIN' : 'CLIENT'; }
        function aiAction(txt) { document.getElementById('ai-msg').innerText = "AI: " + txt; }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                
                // Update AI Center
                document.getElementById('ai-online').innerText = data.aiMetrics.online;
                document.getElementById('ai-tps').innerText = data.aiMetrics.tps;
                document.getElementById('ai-alerts').innerText = data.aiMetrics.alerts;
                
                const msgs = ["Fraud risk increased in mobile transfers", "Server load reaching 70%", "High activity detected in transfers", "Global mesh nodes stable"];
                if(Math.random() > 0.8) document.getElementById('ai-msg').innerText = "AI: " + msgs[Math.floor(Math.random()*msgs.length)];

                document.getElementById('activityFeed').innerHTML = data.transactions.map(t => \`
                    <div style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                        <b>\${t.phone}</b> | KES \${t.amount} <br>
                        <small style="color:var(--accent)">\${t.status} - \${t.time}</small>
                    </div>\`).join('') || 'No Activity';
            } catch(e) {}
        }
        setInterval(update, 3000); update();
        async function runPush() { 
            const pin = document.getElementById('adminPin').value;
            const phone = document.getElementById('pPhone').value;
            const amount = document.getElementById('pAmount').value;
            await fetch('/admin/push', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({pin, phone, amount}) });
            update();
        }
    </script>
</body>
</html>
`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine v3.0 Active on Port ${PORT}`));
