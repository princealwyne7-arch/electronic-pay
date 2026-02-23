const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];
let notifications = [];

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
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
        }, {
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });
        const trackingId = response.data.merchant_request_id || Date.now();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/callback', (req, res) => {
    const bodyText = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyText.includes(String(t.phone)));
    if (tx) { tx.status = "Successful ✅"; }
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay Elite</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; }
        
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .logo-area { display:flex; align-items:center; gap:12px; font-weight:800; font-size:18px; }
        
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s ease; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }

        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; }
        
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; outline:none; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; cursor:pointer; box-shadow: 0 8px 15px rgba(40,167,69,0.2); }

        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; transition: 0.2s; }
        .nav-item.active { color: #0f172a; }
        .nav-item i { font-size: 24px; display: block; margin-bottom: 4px; }
    </style>
</head>
<body>

    <div class="topbar">
        <div class="logo-area">
            <span style="font-size:22px;">☰</span>
            <span>Electronic <span style="color:var(--accent)">Pay</span></span>
        </div>
        <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; height:35px; border-radius:50%; border:2px solid var(--accent);">
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div style="font-size:12px; opacity:0.7; font-weight:600;">DAILY TOTAL REVENUE</div>
            <h1 id="totalRev" style="margin:8px 0; font-size:36px;">KES 0</h1>
            <div style="font-size:11px; background:rgba(255,255,255,0.1); display:inline-block; padding:4px 10px; border-radius:8px;">AI Health: 820</div>
        </div>

        <div class="card">
            <h3 style="margin-top:0;">Smart Command</h3>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Manager PIN" required>
                <input type="number" name="phone" placeholder="Recipient (254...)" required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" class="btn-exec">AUTHORIZE STK PUSH</button>
            </form>
        </div>

        <div class="card">
            <h4 style="margin:0 0 15px 0;">Live Activity</h4>
            <div id="activityFeed" style="font-size:13px;">Syncing...</div>
        </div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="card">
            <h4 style="color:#28a745; margin-top:0;">GLOBAL & REGIONAL SETTINGS</h4>
            <div class="row"><span>🌍 Multi-Currency Accounts</span><b>FX Active</b></div>
            <div class="row"><span>🗣️ Language Selector</span><b>AI Trans</b></div>
            <div class="row"><span>🕒 Time Zone Sync</span><b>UTC/Local</b></div>
            <div class="row"><span>🇰🇪 Regional Rails</span><b>Smart Route</b></div>
            <div class="row"><span>🔒 FX Rate Lock</span><b>AI Alert</b></div>
            <div class="row"><span>⚖️ Compliance Audit</span><b>AML Logs</b></div>
        </div>
        <div class="card">
            <h4 style="color:#3b82f6; margin-top:0;">ADVANCED MODES</h4>
            <div class="row"><span>🚀 Smart Migration</span><b>Enabled</b></div>
            <div class="row"><span>📉 Economic Alerts</span><b>AI Score</b></div>
            <div class="row"><span>📍 Geo-Optimization</span><b>Fallback</b></div>
        </div>


    <div id="tab-insights" class="tab-content">
        <div class="card">
            <h3>📊 Financial Intelligence</h3>
            <div style="height:150px; background:#f1f5f9; border-radius:15px; display:flex; align-items:center; justify-content:center; color:#94a3b8;">
                [ AI Growth Chart Loading... ]
            </div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="card" style="border-left: 5px solid #ef4444;">
            <h3 style="color:#ef4444;">Security Core</h3>
            <button class="btn-exec" style="background:#ef4444;" onclick="alert('Panic Lockdown Initiated')">ACTIVATE PANIC MODE</button>
        </div>
    </div>

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
            window.scrollTo(0,0);
        }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                const feed = document.getElementById('activityFeed');
                feed.innerHTML = data.transactions.length ? data.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                        <span><b>\${t.phone}</b><br><small style="color:#94a3b8">\${t.time}</small></span>
                        <span style="text-align:right;"><b style="color:var(--accent)">KES \${t.amount}</b><br><small>\${t.status}</small></span>
                    </div>
                \`).join('') : 'No recent activity';
            } catch(e) {}
        }
        setInterval(update, 3000);
        update();
    </script>
</body>
</html>
    `);
});

app.listen(process.env.PORT || 3000);
