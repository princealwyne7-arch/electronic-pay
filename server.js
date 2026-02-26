const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bank_db")
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
        
        // Master AI Command Center Data
        res.json({ 
            transactions, 
            todayTotal, 
            latency: Math.floor(Math.random() * 35) + 10,
            aiMetrics: {
                usersOnline: Math.floor(Math.random() * 100) + 12,
                tps: (Math.random() * 8).toFixed(2),
                activeTransfers: Math.floor(Math.random() * 15),
                fraudAlerts: Math.floor(Math.random() * 2),
                sysHealth: "OPTIMAL",
                secLevel: "MAXIMUM",
                riskLevel: "LOW"
            }
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

app.get('/', (req, res) => {
    res.send(\`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>AI Command Center | Elite Banking</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --ai-blue: #00f2ff; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; }
        
        /* Side Drawer & Master AI Center */
        .side-drawer { position:fixed; left:-320px; top:0; width:320px; height:100%; background:var(--primary); z-index:4000; transition:0.3s; padding:20px; box-sizing:border-box; color:white; overflow-y:auto; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:2999; backdrop-filter: blur(4px); }
        
        .ai-command-center { background: rgba(0, 242, 255, 0.05); border: 1px solid var(--ai-blue); border-radius: 16px; padding: 15px; margin-bottom: 25px; }
        .ai-title { color: var(--ai-blue); font-weight: 800; font-size: 14px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        
        .live-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 10px; }
        .live-item { background: rgba(255,255,255,0.03); padding: 8px; border-radius: 8px; border: 0.5px solid rgba(0,242,255,0.2); }
        .live-item b { display: block; color: var(--ai-blue); font-size: 12px; margin-top: 2px; }

        .meter-box { margin: 12px 0; }
        .m-label { font-size: 9px; display: flex; justify-content: space-between; margin-bottom: 4px; color: #94a3b8; }
        .m-bar { height: 4px; background: #334155; border-radius: 2px; overflow: hidden; }
        .m-fill { height: 100%; background: var(--ai-blue); transition: 1s; }

        .ai-suggestion { background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; font-size: 11px; margin: 10px 0; border-left: 3px solid var(--ai-blue); }
        .ai-btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .ai-btn { background: transparent; border: 1px solid var(--ai-blue); color: var(--ai-blue); padding: 6px; border-radius: 6px; font-size: 10px; cursor: pointer; }
        
        /* Main UI Components */
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .card { background: var(--card); border-radius: 24px; padding: 22px; margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; }
        .tab-content { display: none; padding: 85px 15px 20px 15px; }
        .active-tab { display: block; }
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; flex:1; }
        .nav-item.active { color: var(--primary); }
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="closeAll()"></div>

    <div class="side-drawer" id="drawer">
        <div class="ai-command-center">
            <div class="ai-title">🧠 AI COMMAND CENTER</div>
            <div class="live-grid">
                <div class="live-item">Users Online<b id="m-users">0</b></div>
                <div class="live-item">TPS<b id="m-tps">0.00</b></div>
                <div class="live-item">Active Transfers<b id="m-active">0</b></div>
                <div class="live-item">Fraud Alerts<b id="m-fraud" style="color:var(--red)">0</b></div>
                <div class="live-item">System Health<b id="m-health">Optimal</b></div>
                <div class="live-item">Security Level<b id="m-sec">Maximum</b></div>
            </div>

            <div class="meter-box">
                <div class="m-label"><span>SYSTEM POWER</span><span id="v-pwr">98%</span></div>
                <div class="m-bar"><div class="m-fill" style="width:98%"></div></div>
            </div>
            <div class="meter-box">
                <div class="m-label"><span>SECURITY METER</span><span id="v-sec">100%</span></div>
                <div class="m-bar"><div class="m-fill" style="width:100%; background:var(--accent)"></div></div>
            </div>
            <div class="meter-box">
                <div class="m-label"><span>AI CONFIDENCE</span><span id="v-conf">95%</span></div>
                <div class="m-bar"><div class="m-fill" style="width:95%; background:#a855f7"></div></div>
            </div>

            <div class="ai-suggestion" id="ai-hint">AI: Monitoring global network nodes...</div>
            <div class="ai-btn-group">
                <button class="ai-btn" onclick="aiTrigger('Optimizing Engines...')">Optimize</button>
                <button class="ai-btn" onclick="aiTrigger('Security Hardened.')">Activate Prot.</button>
            </div>
            <div style="font-size:8px; margin-top:10px; color:#64748b;">CONNECTED: Vault, STK, AI, API, Global Mesh</div>
        </div>

        <div style="padding:10px; font-weight:bold; font-size:12px;">MANAGER ADMIN</div>
        <a href="#" style="display:block; padding:12px; color:white; text-decoration:none; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.05)">👤 Profile Management</a>
        <a href="#" style="display:block; padding:12px; color:white; text-decoration:none; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.05)">⚙️ System Settings</a>
    </div>

    <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px;">
            <span onclick="toggleMenu()" style="font-size:24px; cursor:pointer;">☰</span>
            <div onclick="toggleAdminMode()" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; border-radius:50%; border:2px solid var(--accent);">
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
            <div style="font-size:10px; color:var(--ai-blue)">AI Sentry: Active</div>
        </div>

        <div class="card" id="adminControl" style="display:none; border: 2px solid var(--accent);">
            <h3 style="margin-top:0;">Manager STK Push</h3>
            <input type="password" id="adminPin" placeholder="Admin PIN (5566)">
            <input type="number" id="pPhone" placeholder="Recipient 254...">
            <input type="number" id="pAmount" placeholder="Amount">
            <button onclick="runPush()" class="btn-exec">AUTHORIZE TRANSFER</button>
        </div>

        <div class="card">
            <h4 style="margin:0 0 15px 0;">Live Activity Feed</h4>
            <div id="activityFeed" style="font-size:13px;">Syncing with AI Engines...</div>
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
        function aiTrigger(msg) { document.getElementById('ai-hint').innerText = "AI: " + msg; }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                
                // Update AI Center Meters
                document.getElementById('m-users').innerText = data.aiMetrics.usersOnline;
                document.getElementById('m-tps').innerText = data.aiMetrics.tps;
                document.getElementById('m-fraud').innerText = data.aiMetrics.fraudAlerts;
                
                if(Math.random() > 0.8) {
                    const hints = ["Fraud risk increased in mobile transfers", "Server load reaching 70%", "High activity detected in transfers"];
                    document.getElementById('ai-hint').innerText = "AI: " + hints[Math.floor(Math.random()*hints.length)];
                }

                document.getElementById('activityFeed').innerHTML = data.transactions.map(t => \`
                    <div style="padding:10px 0; border-bottom:1px solid #f1f5f9;">
                        <b>\${t.phone}</b> | KES \${t.amount} <br>
                        <small>\${t.status} - \${t.time}</small>
                    </div>\`).join('') || 'Waiting for activity...';
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
\`);
});

app.listen(process.env.PORT || 3000, () => console.log("Engine Running"));
