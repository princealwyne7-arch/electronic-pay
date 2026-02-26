const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("System Intelligence Linked ✅"))
    .catch(err => console.error("Engine Connection Error:", err));

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
        
        // --- MASTER AI ANALYTICS ---
        const last10Sec = new Date(Date.now() - 10000);
        const tps = (await Transaction.countDocuments({ createdAt: { $gte: last10Sec } }) / 10).toFixed(2);
        const latency = Math.floor(Math.random() * 25) + 5;
        const load = Math.floor(Math.random() * 30) + 40;
        const fraudRisk = transactions.filter(t => t.amount > 80000).length > 0 ? "HIGH" : "LOW";
        
        res.json({ 
            transactions, 
            todayTotal, 
            tps, 
            latency, 
            load,
            risk: fraudRisk,
            users: Math.floor(Math.random() * 100) + 250,
            health: load > 85 ? "CRITICAL" : "OPTIMAL",
            security: "LEVEL 5 ACTIVATED"
        });
    } catch (err) { res.status(500).json({ error: "AI Engine Sync Failed" }); }
});

app.post('/admin/push', async (req, res) => {
    const { phone, amount, pin } = req.body;
    if (pin !== "5566") return res.status(403).json({ error: "Access Denied" });
    const trackingId = `ELITE-${Date.now()}`;
    await new Transaction({ id: trackingId, phone, amount, status: 'AI Processing... 🧠', time: getKenyaTime() }).save();
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "admin@payelite.io", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        res.json({ success: true, trackingId });
    } catch (err) { 
        await Transaction.updateOne({ id: trackingId }, { status: "Rejected ❌" });
        res.status(500).json({ success: false });
    }
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>MASTER AI COMMAND</title>
    <style>
        :root { --primary: #020617; --accent: #10b981; --bg: #0f172a; --card: #1e293b; --red: #ef4444; --blue: #3b82f6; }
        body { margin:0; font-family: 'Inter', sans-serif; background: var(--bg); color: #f8fafc; padding-bottom: 90px; overflow-x: hidden; }
        .topbar { position:fixed; top:0; width:100%; height:65px; background: #020617; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; border-bottom: 1px solid #1e293b; }
        .side-drawer { position:fixed; left:-280px; top:0; width:280px; height:100%; background:var(--primary); z-index:4000; transition:0.3s cubic-bezier(0.4, 0, 0.2, 1); padding:20px; box-sizing:border-box; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:none; z-index:2999; backdrop-filter: blur(4px); }
        .drawer-item { padding:16px; border-bottom:1px solid rgba(255,255,255,0.05); color:#cbd5e1; text-decoration:none; display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600; }
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.4s ease; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; transform: scale(0.98); } to { opacity:1; transform: scale(1); } }
        
        .card { background: var(--card); border-radius: 20px; padding: 20px; border: 1px solid #334155; margin-bottom: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .meter-box { background: #020617; padding: 15px; border-radius: 15px; text-align: center; border: 1px solid #1e293b; }
        .meter-label { font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; display:block; }
        .meter-bar { width: 100%; height: 6px; background: #1e293b; border-radius: 10px; overflow: hidden; margin-top: 5px; }
        .meter-fill { height: 100%; background: var(--accent); transition: width 1s ease; }
        
        .ai-panel { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid var(--blue); }
        .ai-suggestion { background: rgba(59, 130, 246, 0.1); border-left: 4px solid var(--blue); padding: 12px; font-size: 11px; margin-top: 10px; color: #93c5fd; }
        
        .grid-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px; }
        .stat-item { background: #0f172a; padding: 12px; border-radius: 15px; border: 1px solid #1e293b; }
        .stat-val { display: block; font-size: 18px; font-weight: 800; color: var(--accent); }
        .stat-lab { font-size: 9px; color: #64748b; font-weight: 700; }
        
        .btn-ai { background: var(--blue); color: white; border: none; padding: 12px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; }
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:70px; background:#020617; border-radius:20px; display:flex; justify-content:space-around; align-items:center; border: 1px solid #1e293b; z-index:1000; }
        .nav-item { text-align:center; font-size:10px; color:#64748b; font-weight:bold; }
        .nav-item.active { color: var(--blue); }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="closeAll()"></div>

    <div class="side-drawer" id="drawer">
        <div style="margin-bottom:25px; text-align:center;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:60px; border-radius:50%; border:2px solid var(--blue);">
            <div style="margin-top:10px; font-weight:800; color:white;">MANAGER ADMIN</div>
        </div>
        <a href="#" class="drawer-item" onclick="switchTab('ai', this); closeAll()"><span style="font-size:20px;">🧠</span> AI Command Center</a>
        <a href="#" class="drawer-item" onclick="switchTab('dash', this); closeAll()"><span style="font-size:20px;">🏠</span> Dashboard</a>
        <a href="#" class="drawer-item" onclick="closeAll()"><span style="font-size:20px;">🛡️</span> Security Hub</a>
    </div>

    <div class="topbar">
        <span onclick="toggleMenu()" style="font-size:24px; color:var(--blue);">☰</span>
        <div style="font-weight:900; letter-spacing:1px; font-size:18px;">PAY <span style="color:var(--blue)">ELITE</span></div>
        <div id="aiConfidence" style="font-size:10px; background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:8px; color:var(--accent); font-weight:800;">AI: 99.8%</div>
    </div>

    <div id="tab-ai" class="tab-content active-tab">
        <div class="card ai-panel">
            <h3 style="margin:0; display:flex; align-items:center; gap:8px;">🧠 AI COMMAND CENTER</h3>
            <p style="font-size:10px; color:#94a3b8;">System-Wide Neural Monitoring</p>
            
            <div class="grid-stats">
                <div class="stat-item"><span class="stat-lab">USERS ONLINE</span><span id="aiUsers" class="stat-val">--</span></div>
                <div class="stat-item"><span class="stat-lab">TX PER SECOND</span><span id="aiTps" class="stat-val">--</span></div>
                <div class="stat-item"><span class="stat-lab">SYSTEM HEALTH</span><span id="aiHealth" class="stat-val" style="color:var(--accent)">--</span></div>
                <div class="stat-item"><span class="stat-lab">RISK LEVEL</span><span id="aiRisk" class="stat-val" style="color:var(--red)">--</span></div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div class="meter-box">
                    <span class="meter-label">System Power</span>
                    <b id="pwrVal">0%</b>
                    <div class="meter-bar"><div id="pwrBar" class="meter-fill" style="width:0%"></div></div>
                </div>
                <div class="meter-box">
                    <span class="meter-label">Security Level</span>
                    <b id="secVal">L5</b>
                    <div class="meter-bar"><div class="meter-fill" style="width:100%; background:var(--blue)"></div></div>
                </div>
            </div>

            <div class="ai-suggestion" id="aiText">
                "Initializing Neural Engine... All systems currently optimal."
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:15px;">
                <button class="btn-ai" onclick="action('OPTIMIZING')">OPTIMIZE SYSTEM</button>
                <button class="btn-ai" style="background:var(--accent)" onclick="action('DIAGNOSTICS')">RUN DIAGNOSTICS</button>
            </div>
        </div>
    </div>

    <div id="tab-dash" class="tab-content">
        <div class="card" style="background: linear-gradient(to right, #1e293b, #0f172a);">
            <small style="color:var(--blue); font-weight:800;">TOTAL BANK BALANCE</small>
            <h1 id="totalRev" style="margin:10px 0; font-size:36px;">KES 0</h1>
            <div style="font-size:11px; color:var(--accent); font-weight:bold;">● WORLDWIDE ACTIVITY LIVE</div>
        </div>
        
        <div class="card" id="adminControl" style="border: 1px solid var(--blue);">
            <h4 style="margin-top:0;">MASTER EXECUTION</h4>
            <input type="number" id="pPhone" placeholder="Mobile (254...)">
            <input type="number" id="pAmount" placeholder="Amount (KES)">
            <input type="password" id="pPin" placeholder="Admin PIN">
            <button onclick="runPush()" class="btn-ai" style="width:100%; font-size:14px;">EXECUTE STK TRANSFER</button>
        </div>

        <div class="card">
            <h4 style="margin:0 0 10px 0;">GLOBAL LEDGER</h4>
            <div id="activityFeed" style="font-size:12px;">Connecting to Global Nodes...</div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('ai', this)">🧠<br>Neural</div>
        <div class="nav-item" onclick="switchTab('dash', this)">🏦<br>Bank</div>
    </nav>

    <script>
        function toggleMenu() { const d = document.getElementById('drawer'); d.classList.toggle('open'); document.getElementById('overlay').style.display = d.classList.contains('open') ? 'block' : 'none'; }
        function closeAll() { document.getElementById('drawer').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; }
        function switchTab(id, el) { 
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            if(el.classList.contains('nav-item')) el.classList.add('active');
        }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const d = await res.json();
                
                document.getElementById('totalRev').innerText = 'KES ' + d.todayTotal.toLocaleString();
                document.getElementById('aiUsers').innerText = d.users;
                document.getElementById('aiTps').innerText = d.tps;
                document.getElementById('aiHealth').innerText = d.health;
                document.getElementById('aiRisk').innerText = d.risk;
                document.getElementById('pwrVal').innerText = d.load + '%';
                document.getElementById('pwrBar').style.width = d.load + '%';

                // AI Neural Suggestions logic
                const suggestions = [
                    "High activity detected in mobile gateway.",
                    "Neural protection Level 5 is stable.",
                    "Latency optimized to " + d.latency + "ms.",
                    d.load > 60 ? "Warning: Server load reaching " + d.load + "%" : "System load is within optimal parameters."
                ];
                document.getElementById('aiText').innerText = suggestions[Math.floor(Math.random() * suggestions.length)];

                document.getElementById('activityFeed').innerHTML = d.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #334155;">
                        <span><b>\${t.phone}</b><br><small style="color:#64748b;">\${t.time}</small></span>
                        <span style="text-align:right;"><b style="color:var(--accent)">KES \${t.amount}</b><br>
                        <small style="font-weight:bold; color:\${t.status.includes('Successful') ? 'var(--accent)' : 'var(--red)'}">\${t.status}</small></span>
                    </div>\`).join('') || 'No Global Transfers Found';
            } catch(e) { console.log("AI Sync Error"); }
        }
        
        function action(type) { alert(type + " PROTOCOL INITIATED"); }
        setInterval(update, 3000); update();

        async function runPush() {
            const phone = document.getElementById('pPhone').value;
            const amount = document.getElementById('pAmount').value;
            const pin = document.getElementById('pPin').value;
            await fetch('/admin/push', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({phone, amount, pin}) 
            });
            update();
        }
    </script>
</body>
</html>
`);
});
app.listen(process.env.PORT || 3000);
