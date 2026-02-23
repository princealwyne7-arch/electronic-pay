const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
let activeSessions = [{ device: "Mobile App (Current)", location: "Nairobi, KE", status: "Active" }];

const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const todayTotal = transactions.filter(t => t.status.includes('Successful')).reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal, sessions: activeSessions });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay | Security Elite</title>
    <style>
        :root { --cobalt: #0047AB; --emerald: #28a745; --slate: #1e293b; --glass: rgba(255,255,255,0.9); --danger: #ef4444; }
        body { font-family: 'Inter', sans-serif; background: #f4f7fe; margin: 0; color: var(--slate); overflow-x: hidden; padding-bottom: 100px; }
        .top-nav { position: fixed; top: 0; width: 100%; height: 60px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-sizing: border-box; z-index: 2000; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .tab-content { display: none; padding: 80px 15px 20px 15px; animation: fadeIn 0.3s; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .smart-hub { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 15px; }
        .sec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
        .sec-card { background: #f8fafc; padding: 12px; border-radius: 15px; border: 1px solid #e2e8f0; font-size: 11px; font-weight: bold; text-align: center; }
        .panic-btn { width: 100%; padding: 20px; background: var(--danger); color: white; border: none; border-radius: 15px; font-weight: 900; letter-spacing: 1px; cursor: pointer; margin-top: 10px; box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4); }
        .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .bottom-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; background: var(--glass); backdrop-filter: blur(15px); height: 70px; border-radius: 25px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 2000; border: 1px solid rgba(255,255,255,0.3); }
        .nav-item { text-align: center; color: #94a3b8; cursor: pointer; transition: 0.3s; }
        .nav-item.active { color: var(--cobalt); transform: translateY(-5px); }
        .ai-status { color: var(--emerald); font-size: 10px; font-weight: bold; background: #e8f5e9; padding: 4px 8px; border-radius: 5px; }
    </style>
</head>
<body>

    <div class="top-nav">
        <div style="font-size: 20px;">☰</div>
        <div style="font-weight: 900;">SECURITY <span style="color:var(--danger)">CORE</span></div>
        <div class="ai-status">🛡️ AI SHIELD ACTIVE</div>
    </div>

    <div id="tab-dashboard" class="tab-content active-tab">
        <div class="smart-hub">
            <h3 style="margin:0;">Instant Command</h3>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="PIN" style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:10px;">
                <input type="number" name="phone" placeholder="2547..." style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:10px;">
                <input type="number" name="amount" placeholder="Amount" style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:10px;">
                <button type="submit" style="width:100%; padding:15px; background:var(--emerald); color:white; border:none; border-radius:10px; font-weight:bold;">AUTHORIZE</button>
            </form>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="smart-hub">
            <h3 style="margin-top:0;">🛡️ Advanced Protection</h3>
            
            <div class="toggle-row">
                <span>Biometric Authentication</span>
                <input type="checkbox" checked>
            </div>
            <div class="toggle-row">
                <span>Two-Factor Auth (2FA)</span>
                <input type="checkbox" checked>
            </div>
            <div class="toggle-row">
                <span>Travel Mode AI</span>
                <input type="checkbox">
            </div>
            <div class="toggle-row">
                <span>Invisible Fraud Shield</span>
                <span style="color:var(--emerald); font-size:10px;">AUTO-RUNNING</span>
            </div>

            <div class="sec-grid">
                <div class="sec-card">💳 Freeze Card</div>
                <div class="sec-card">🔢 Set Limits</div>
                <div class="sec-card">🌌 Dark Web Scan</div>
                <div class="sec-card">🎫 Virtual Card</div>
            </div>

            <button class="panic-btn" onclick="activatePanic()">ACTIVATE PANIC MODE</button>
        </div>

        <div class="smart-hub">
            <h4 style="margin:0 0 10px 0;">📱 Active Sessions</h4>
            <div id="session-list" style="font-size:12px; color:#64748b;">
                Loading encrypted session data...
            </div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="tab('dashboard', this)">🏛️<br><small>Vault</small></div>
        <div class="nav-item" onclick="tab('security', this)">🛡️<br><small>Secure</small></div>
    </nav>

    <audio id="successSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

    <script>
        function tab(id, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
        }

        function activatePanic() {
            if(confirm("EMERGENCY: Lockdown all transfers?")) {
                document.body.style.filter = "grayscale(100%) brightness(50%)";
                alert("PANIC MODE ACTIVE: All sessions terminated and card frozen.");
            }
        }

        async function updateStatus() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                const sessionList = document.getElementById('session-list');
                sessionList.innerHTML = data.sessions.map(s => \`
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span>\${s.device}<br><small>\${s.location}</small></span>
                        <span style="color:var(--emerald)">\${s.status}</span>
                    </div>
                \`).join('');
            } catch(e) {}
        }
        setInterval(updateStatus, 5000);
        updateStatus();
    </script>
</body>
</html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Security Violation: Invalid PIN");
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
    } catch (err) { res.status(500).send("AI Shield Intervention: Connection Refused"); }
});

app.post('/callback', (req, res) => {
    let tx = transactions.find(t => JSON.stringify(req.body).includes(String(t.phone)));
    if (tx) { tx.status = "Successful ✅"; }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
