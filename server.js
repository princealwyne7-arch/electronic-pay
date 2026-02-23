cat << 'EOF' > server.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];
const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const todayTotal = transactions.filter(t => t.status.includes('Successful')).reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal, aiScore: 820 });
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.status(403).send("Unauthorized");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        transactions.unshift({ id: Date.now(), phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay Elite</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; --text-muted: #64748b; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; }
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .logo-area { display:flex; align-items:center; gap:12px; font-weight:800; font-size:18px; }
        .tab-content { display: none; padding: 85px 15px 20px 15px; }
        .active-tab { display: block; }
        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; }
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; outline:none; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; cursor:pointer; }
        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .setting-title { font-weight: 700; font-size: 13px; }
        .setting-desc { font-size: 11px; color: var(--text-muted); }
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; }
        .nav-item.active { color: #0f172a; }
    </style>
</head>
<body>
    <div class="topbar">
        <div class="logo-area"><span>☰</span> <span>Electronic <span style="color:var(--accent)">Pay</span></span></div>
        <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px;height:35px;border-radius:50%;border:2px solid var(--accent);">
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div style="font-size:12px;opacity:0.7;">DAILY TOTAL REVENUE</div>
            <h1 id="totalRev" style="margin:8px 0;font-size:36px;">KES 0</h1>
        </div>
        <div class="card">
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Manager PIN" required>
                <input type="number" name="phone" placeholder="Recipient" required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" class="btn-exec">AUTHORIZE STK PUSH</button>
            </form>
        </div>
        <div class="card"><div id="activityFeed">Syncing...</div></div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="card" style="background:#0f172a; color:white;">
            <h2 style="margin:0;">Wealth Vault Core</h2>
            <p style="font-size:12px; opacity:0.8;">Global & Regional Management</p>
        </div>
        <div class="card">
            <h4 style="color:var(--accent); margin-top:0;">GLOBAL CONFIGURATION</h4>
            <div class="setting-row"><div><div class="setting-title">Multi-Currency Accounts</div><div class="setting-desc">FX & Virtual Wallets</div></div></div>
            <div class="setting-row"><div><div class="setting-title">Language Selector</div><div class="setting-desc">AI Contextual Translation</div></div></div>
            <div class="setting-row"><div><div class="setting-title">Regional Payment Rails</div><div class="setting-desc">Smart Routing Kenya</div></div></div>
            <div class="setting-row" style="border:none;"><div><div class="setting-title">Compliance Audit</div><div class="setting-desc">AML/KYC Regulatory Logs</div></div></div>
        </div>
    </div>

    <div id="tab-insights" class="tab-content"><div class="card"><h3>📊 Financial Intelligence</h3></div></div>
    <div id="tab-security" class="tab-content"><div class="card"><h3>🛡️ Security Core</h3></div></div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼<br>Vault</div>
        <div class="nav-item" onclick="switchTab('insights', this)">📊<br>Insights</div>
        <div class="nav-item" onclick="switchTab('security', this)">🛡️<br>Secure</div>
    </nav>

    <script>
        function switchTab(id, el) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }
        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                const feed = document.getElementById('activityFeed');
                if (data.transactions.length) {
                    feed.innerHTML = data.transactions.map(t => '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;"><span><b>' + t.phone + '</b><br><small>' + t.time + '</small></span><span style="text-align:right;"><b style="color:var(--accent)">KES ' + t.amount + '</b><br><small>' + t.status + '</small></span></div>').join('');
                }
            } catch(e) {}
        }
        setInterval(update, 4000); update();
    </script>
</body>
</html>
    `);
});
app.listen(process.env.PORT || 3000);
EOF

git add server.js
git commit -m "Deployment: Fixed SyntaxError and Vault UI"
git push origin main

