const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// DATABASE CONFIG
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/elitedb";
mongoose.connect(MONGO_URI)
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

// LIVE ACTIVITY ENGINE (Logic Swapped from Code 1)
app.get('/api/status', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(15);
        const successfulTxs = transactions.filter(t => t.status.includes('Successful'));
        const todayTotal = successfulTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
        res.json({ 
            transactions, 
            todayTotal, 
            latency: Math.floor(Math.random() * 30) + 5 
        });
    } catch (err) { res.status(500).json({ error: "Sync Failed" }); }
});

app.post('/admin/push', async (req, res) => {
    const { phone, amount, pin } = req.body;
    if (pin !== "5566") return res.status(403).json({ error: "Invalid PIN" });
    
    const tid = `TXN${Date.now()}`;
    await new Transaction({ id: tid, phone, amount: parseInt(amount), status: 'Processing... 🔄', time: getKenyaTime() }).save();

    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE || "PNT_957342",
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, { 
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY || "hmp_AegEZDHxA8uOAel2wp3ttkpK4FeBPwVa6bNiJcfE" } 
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/callback', async (req, res) => {
    const data = JSON.stringify(req.body).toLowerCase();
    const filter = { $or: [{ id: req.body.merchant_request_id }, { phone: req.body.mobile_number }]};
    let status = 'Failed ⚠️';
    if (data.includes('success') || data.includes('"0"') || data.includes('completed')) status = 'Successful ✅';
    else if (data.includes('cancel') || data.includes('1032')) status = 'Cancelled ❌';
    await Transaction.findOneAndUpdate(filter, { status: status });
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Elite Pay | Banking Engine</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: sans-serif; background: var(--bg); padding-bottom: 90px; }
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .card { background: var(--card); border-radius: 20px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); margin-bottom: 15px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; }
        input { width:100%; padding:14px; margin:8px 0; border:1px solid #e2e8f0; border-radius:12px; box-sizing:border-box; }
        .btn-exec { width:100%; padding:16px; background: var(--accent); color:white; border:none; border-radius:12px; font-weight:bold; cursor:pointer; }
        .bottom-nav { position:fixed; bottom:0; width:100%; height:75px; background:white; display:flex; justify-content:space-around; align-items:center; border-top: 1px solid #eee; z-index:1000; }
        .nav-item { text-align:center; font-size:10px; color:#94a3b8; flex:1; cursor:pointer; }
        .nav-item.active { color: var(--primary); font-weight:bold; }
        .fx-btn { padding:10px; background:#f1f5f9; border:none; border-radius:8px; font-weight:bold; font-size:10px; cursor:pointer; }
        .pulse-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; display:inline-block; margin-right:5px; }
    </style>
</head>
<body>
    <div class="topbar">
        <div style="font-weight:800; font-size:18px;">Elite <span style="color:var(--accent)">Pay</span></div>
        <div style="font-size:10px;"><div class="pulse-dot"></div><span id="latency">PULSE: 0ms</span></div>
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <small>TOTAL SUCCESS VOLUME</small>
            <h1 id="totalRev" style="margin:5px 0;">KES 0</h1>
            <div style="font-size:11px; background:rgba(255,255,255,0.1); padding:4px; border-radius:8px;">AI Health: Optimal</div>
        </div>
        <div class="card">
            <h3 style="margin:0 0 10px 0;">Initiate STK</h3>
            <input type="password" id="adminPin" placeholder="Manager PIN">
            <input type="number" id="pPhone" placeholder="2547...">
            <input type="number" id="pAmount" placeholder="Amount">
            <button onclick="runPush()" class="btn-exec">SEND PUSH</button>
        </div>
    </div>

    <div id="tab-activity" class="tab-content">
        <div class="card">
            <h3>Live Activity</h3>
            <div id="activityFeed">Syncing Ledger...</div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="card">
            <h3>Audio Diagnostics (15+ Sounds)</h3>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                ${Array.from({length: 15}, (_, i) => \`<button class="fx-btn" onclick="playSfx(\${i+1})">FX \${i+1}</button>\`).join('')}
            </div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('activity', this)">📊<br>Activity</div>
        <div class="nav-item" onclick="switchTab('security', this)">🛡️<br>Secure</div>
    </nav>

    <script>
        let lastCount = 0;
        const playSfx = (idx) => {
            const audio = new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + idx + ".mp3");
            audio.play().catch(() => {});
        };

        function switchTab(id, el) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }

        async function refresh() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('latency').innerText = 'PULSE: ' + data.latency + 'ms';
                if(data.transactions.length > lastCount) {
                    if(lastCount > 0) playSfx(1);
                    lastCount = data.transactions.length;
                }
                document.getElementById('activityFeed').innerHTML = data.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:12px;">
                        <span><b>\${t.phone}</b><br><small>\${t.time}</small></span>
                        <span style="text-align:right;"><b>KES \${t.amount}</b><br>
                        <small style="color:\${t.status.includes('Successful') ? '#28a745' : '#ef4444'};">\${t.status}</small></span>
                    </div>\`).join('') || 'No transactions';
            } catch(e) {}
        }

        async function runPush() {
            const pin = document.getElementById('adminPin').value;
            const phone = document.getElementById('pPhone').value;
            const amount = document.getElementById('pAmount').value;
            const res = await fetch('/admin/push', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({pin, phone, amount})
            });
            if(res.ok) alert("Push Sent");
            else alert("Error");
            refresh();
        }
        setInterval(refresh, 3000); refresh();
    </script>
</body>
</html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Elite Engine Running..."));
