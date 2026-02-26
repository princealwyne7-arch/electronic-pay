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
        
        // AI COMMAND CENTER METRICS ENGINE
        const aiMetrics = {
            tps: (Math.random() * 5 + 1).toFixed(2),
            online: Math.floor(Math.random() * 50 + 15),
            activeTrans: transactions.filter(t => t.status.includes('Processing')).length,
            fraud: transactions.filter(t => t.status.includes('Failed')).length,
            health: "OPTIMAL",
            risk: "LOW",
            secLevel: "MAXIMUM"
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
    <title>Elite AI | Command Center</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --ai-blue: #00f2ff; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; overflow-x: hidden; }
        
        /* SIDE DRAWER & HIGH-TECH AI CENTER */
        .side-drawer { position:fixed; left:-320px; top:0; width:320px; height:100%; background:var(--primary); z-index:4000; transition:0.3s cubic-bezier(0.4, 0, 0.2, 1); padding:15px; box-sizing:border-box; color:white; overflow-y:auto; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:2999; backdrop-filter: blur(4px); }
        
        .ai-command-center { background: rgba(0, 242, 255, 0.03); border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 20px; padding: 15px; margin-bottom: 20px; box-shadow: 0 0 20px rgba(0,0,0,0.2); }
        .ai-header { color: var(--ai-blue); font-weight: 800; font-size: 13px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; }
        
        .ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; }
        .ai-stat { background: rgba(255,255,255,0.03); padding: 8px; border-radius: 10px; border: 0.5px solid rgba(255,255,255,0.05); }
        .ai-stat span { display: block; font-size: 8px; color: #94a3b8; font-weight: bold; }
        .ai-stat b { display: block; font-size: 11px; color: var(--ai-blue); margin-top: 2px; }

        .meter-container { margin: 10px 0; }
        .meter-label { display: flex; justify-content: space-between; font-size: 8px; color: #64748b; font-weight: 800; margin-bottom: 4px; }
        .meter-bg { height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden; }
        .meter-fill { height: 100%; background: var(--ai-blue); transition: width 1s ease-in-out; }

        .ai-suggestion-box { background: rgba(255,255,255,0.02); border-left: 3px solid var(--ai-blue); padding: 10px; border-radius: 4px; margin: 15px 0; }
        .ai-msg { font-size: 10px; font-style: italic; color: #cbd5e1; }
        
        .ai-btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .ai-action-btn { background: transparent; border: 1px solid rgba(0, 242, 255, 0.3); color: var(--ai-blue); padding: 7px; border-radius: 8px; font-size: 9px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .ai-action-btn:active { background: var(--ai-blue); color: var(--primary); }

        .connection-footer { font-size: 7px; color: #475569; margin-top: 15px; border-top: 1px solid #1e293b; padding-top: 10px; line-height: 1.5; }

        /* ORIGINAL STYLES PRESERVED */
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; }
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s ease; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; flex:1; }
        .nav-item.active { color: var(--primary); }
        
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; }
        .v-item { background: white; padding: 18px 10px; border-radius: 20px; border: 1px solid #f1f5f9; text-align: center; }
        .vault-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="closeAll()"></div>

    <div class="side-drawer" id="drawer">
        <div style="margin-bottom:20px; display:flex; align-items:center; gap:10px;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:40px; border-radius:50%; border:2px solid var(--accent);">
            <div>
                <div style="font-weight:bold; font-size:14px;">Manager Admin</div>
                <div style="font-size:10px; color:var(--accent);">Elite Control Active ●</div>
            </div>
        </div>

        <div class="ai-command-center">
            <div class="ai-header">🧠 AI Command Center</div>
            <div class="ai-grid">
                <div class="ai-stat"><span>Users Online</span><b id="ai-online">0</b></div>
                <div class="ai-stat"><span>TPS Rate</span><b id="ai-tps">0.00</b></div>
                <div class="ai-stat"><span>Active Trans</span><b id="ai-active">0</b></div>
                <div class="ai-stat"><span>Fraud Alerts</span><b id="ai-fraud" style="color:var(--red)">0</b></div>
                <div class="ai-stat"><span>System Health</span><b id="ai-health">--</b></div>
                <div class="ai-stat"><span>Risk Level</span><b id="ai-risk">LOW</b></div>
            </div>

            <div class="meter-container">
                <div class="meter-label"><span>SYSTEM POWER</span><span id="v-pwr">98%</span></div>
                <div class="meter-bg"><div class="meter-fill" style="width: 98%;"></div></div>
            </div>
            <div class="meter-container">
                <div class="meter-label"><span>SECURITY METER</span><span id="v-sec">100%</span></div>
                <div class="meter-bg"><div class="meter-fill" style="width: 100%; background: var(--accent);"></div></div>
            </div>
            <div class="meter-container">
                <div class="meter-label"><span>NETWORK SPEED</span><span id="v-net">100%</span></div>
                <div class="meter-bg"><div class="meter-fill" style="width: 100%; background: #a855f7;"></div></div>
            </div>
            <div class="meter-container">
                <div class="meter-label"><span>AI CONFIDENCE</span><span id="v-conf">95%</span></div>
                <div class="meter-bg"><div class="meter-fill" style="width: 95%; background: var(--ai-blue);"></div></div>
            </div>

            <div class="ai-suggestion-box">
                <div class="ai-msg" id="ai-msg">AI: Analyzing global transfer engine...</div>
            </div>

            <div class="ai-btn-group">
                <button class="ai-action-btn" onclick="aiTrigger('Optimizing Core...')">Optimize</button>
                <button class="ai-action-btn" onclick="aiTrigger('System Repaired')">Auto Fix</button>
                <button class="ai-action-btn" onclick="aiTrigger('Shields Active')">Protect</button>
                <button class="ai-action-btn" onclick="aiTrigger('Scan Complete')">Diagnostics</button>
            </div>

            <div class="connection-footer">
                CONNECTED TO: Accounts, Vault, Transfers, STK, AI, Security Engines, Global Net, API, Servers.
            </div>
        </div>

        <div style="font-weight:bold; font-size:12px; margin-bottom:10px; color:#94a3b8;">SYSTEM NAV</div>
        <a href="#" class="drawer-item" style="color:white; text-decoration:none; display:block; padding:12px 0; border-bottom:1px solid #1e293b;">👤 Manager Profile</a>
        <a href="#" class="drawer-item" style="color:white; text-decoration:none; display:block; padding:12px 0; border-bottom:1px solid #1e293b;">⚙️ Global Settings</a>
    </div>

    <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px;">
            <span onclick="toggleMenu()" style="font-size:24px; cursor:pointer;">☰</span>
            <div onclick="toggleAdminMode()" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; border-radius:50%; border:2px solid var(--accent);">
                <span style="font-weight:800; font-size:14px;">Pay <span style="color:var(--accent)">Elite</span></span>
            </div>
        </div>
        <div style="font-size:9px; color:#94a3b8; font-weight:800;" id="pulseText">PULSE: 0ms</div>
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div id="modeLabel" style="position:absolute; top:15px; right:15px; background:var(--accent); padding:4px 8px; border-radius:10px; font-size:10px; font-weight:bold;">CLIENT</div>
            <div style="font-size:12px; opacity:0.8;">TOTAL VOLUME</div>
            <h1 id="totalRev" style="margin:8px 0; font-size:36px;">KES 0</h1>
            <div style="font-size:10px; color:var(--ai-blue)">AI Sentry: Active</div>
        </div>

        <div class="card" id="adminControl" style="display:none; border: 2px solid var(--accent);">
            <h3>Admin Command</h3>
            <input type="password" id="adminPin" placeholder="Secure PIN">
            <input type="number" id="pPhone" placeholder="Recipient 254...">
            <input type="number" id="pAmount" placeholder="Amount">
            <button onclick="runPush()" class="btn-exec">AUTHORIZE STK</button>
        </div>

        <div class="card">
            <h4 style="margin:0 0 15px 0;">Live Activity</h4>
            <div id="activityFeed" style="font-size:13px;">Syncing nodes...</div>
        </div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="card balance-card" style="border:1px solid var(--accent)">
            <small>VAULT TOTAL</small>
            <h2 id="vaultTotalDisplay">KES 0</h2>
        </div>
        <div class="vault-grid">
            <div class="v-item"><b>Dashboard</b><br><small>Live Assets</small></div>
            <div class="v-item"><b>Assets</b><br><small>Digital Hub</small></div>
            <div class="v-item"><b>Documents</b><br><small>ID & Bank</small></div>
            <div class="v-item"><b>Recovery</b><br><small>Keys</small></div>
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
        function toggleMenu() { document.getElementById('drawer').classList.toggle('open'); document.getElementById('overlay').style.display = document.getElementById('drawer').classList.contains('open') ? 'block' : 'none'; }
        function closeAll() { document.getElementById('drawer').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; }
        function toggleAdminMode() { isAdmin = !isAdmin; document.getElementById('adminControl').style.display = isAdmin ? 'block' : 'none'; document.getElementById('modeLabel').innerText = isAdmin ? 'ADMIN' : 'CLIENT'; }
        function switchTab(id, el) { document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab')); document.getElementById('tab-' + id).classList.add('active-tab'); document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); el.classList.add('active'); }
        function aiTrigger(msg) { document.getElementById('ai-msg').innerText = "AI: " + msg; }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('vaultTotalDisplay').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('pulseText').innerText = 'PULSE: ' + data.latency + 'ms';
                
                // AI CENTER UPDATE
                document.getElementById('ai-online').innerText = data.aiMetrics.online;
                document.getElementById('ai-tps').innerText = data.aiMetrics.tps;
                document.getElementById('ai-active').innerText = data.aiMetrics.activeTrans;
                document.getElementById('ai-fraud').innerText = data.aiMetrics.fraud;
                document.getElementById('ai-health').innerText = data.aiMetrics.health;
                
                if(Math.random() > 0.8) {
                    const suggestions = ["Fraud risk increased in mobile transfers", "Server load reaching 70%", "High activity detected in transfers", "Global mesh nodes stable"];
                    document.getElementById('ai-msg').innerText = "AI: " + suggestions[Math.floor(Math.random()*suggestions.length)];
                }

                document.getElementById('activityFeed').innerHTML = data.transactions.map(t => \`
                    <div style="padding:10px 0; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between;">
                        <span><b>\${t.phone}</b><br><small>\${t.time}</small></span>
                        <span style="text-align:right;">KES \${t.amount}<br><small>\${t.status}</small></span>
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
app.listen(PORT, () => console.log(`AI Banking Engine Active on ${PORT}`));
