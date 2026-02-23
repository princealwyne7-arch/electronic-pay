const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const todayTotal = transactions.filter(t => t.status.includes('Successful')).reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay | Elite</title>
    <style>
/* STYLE_ZONE */
        :root { --cobalt: #0047AB; --emerald: #28a745; --slate: #1e293b; --glass: rgba(255,255,255,0.9); }
        body { font-family: 'Inter', sans-serif; background: #f4f7fe; margin: 0; color: var(--slate); overflow-x: hidden; padding-bottom: 100px; }
        
        /* Top Navigation & Hamburger */
        .top-nav { position: fixed; top: 0; width: 100%; height: 60px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-sizing: border-box; z-index: 2000; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .menu-btn { font-size: 24px; cursor: pointer; }
        .profile-small { width: 35px; height: 35px; border-radius: 50%; border: 2px solid var(--emerald); }

        /* Sidebar Menu */
        .sidebar { position: fixed; left: -280px; top: 0; width: 280px; height: 100%; background: white; z-index: 3000; transition: 0.4s; box-shadow: 10px 0 30px rgba(0,0,0,0.1); padding: 20px; box-sizing: border-box; }
        .sidebar.active { left: 0; }
        .sidebar-item { padding: 15px; border-bottom: 1px solid #f0f0f0; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 10px; }

        /* Dashboard & Cards */
        .tab-content { display: none; padding: 80px 15px 20px 15px; animation: fadeIn 0.3s; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .bank-card { background: linear-gradient(135deg, #0047AB, #002f75); color: white; padding: 25px; border-radius: 20px; margin-bottom: 20px; position: relative; overflow: hidden; }
        .smart-hub { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 15px; }
        
        /* Bottom Navigation */
        .bottom-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; background: var(--glass); backdrop-filter: blur(15px); height: 70px; border-radius: 25px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 2000; border: 1px solid rgba(255,255,255,0.3); }
        .nav-item { text-align: center; color: #94a3b8; transition: 0.3s; cursor: pointer; }
        .nav-item.active { color: var(--cobalt); transform: translateY(-5px); }
        .nav-icon { font-size: 22px; }
        .nav-label { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }

        /* Features */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .stat-card { background: #f8fafc; padding: 15px; border-radius: 15px; text-align: center; }
        .ai-badge { background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 5px; font-size: 9px; font-weight: bold; }
        
        input, select { width: 100%; padding: 14px; margin: 8px 0; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; }
        .btn-main { width: 100%; padding: 16px; background: var(--emerald); color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>

    <div class="top-nav">
        <div class="menu-btn" onclick="toggleMenu(true)">☰</div>
        <div style="font-weight: 900; letter-spacing: -1px;">ELECTRONIC <span style="color:var(--emerald)">PAY</span></div>
        <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-small">
    </div>

    <div id="sidebar" class="sidebar">
        <div style="text-align: right; font-size: 24px;" onclick="toggleMenu(false)">✕</div>
        <div class="sidebar-item">👤 Profile</div>
        <div class="sidebar-item">⚙️ Account Settings</div>
        <div class="sidebar-item">💼 Business Hub</div>
        <div class="sidebar-item">💎 Global Settings</div>
        <div class="sidebar-item" style="color: #ef4444;">🚪 Logout</div>
    </div>

    <div id="tab-dashboard" class="tab-content active-tab">
        <div class="bank-card">
            <div style="font-size: 12px; opacity: 0.8;">Total Net Worth <span class="ai-badge">AI Score: 850</span></div>
            <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">KES 1,240,500.00</div>
            <div style="font-size: 11px;">7-Day Prediction: <span style="color:#4ade80;">+KES 12,000</span></div>
        </div>
        <div class="grid-2">
            <div class="stat-card"><h3>📈</h3><div style="font-size:10px;">CASH FLOW</div></div>
            <div id="dailyTotal" class="stat-card"><h3>💰</h3><div style="font-size:10px;">TODAY: KES 0</div></div>
        </div>
        <div class="smart-hub">
            <h3 style="font-size:14px; margin-top:0;">Smart Command Center</h3>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Secure PIN" required>
                <input type="number" name="phone" placeholder="2547..." required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" class="btn-main">EXECUTE INSTANT TRANSFER</button>
            </form>
        </div>
    </div>

    <div id="tab-payments" class="tab-content">
        <div class="smart-hub">
            <h3>Payments & Transfers</h3>
            <div class="grid-2">
                <button style="padding:15px; border-radius:10px; border:1px solid #ddd;">QR Pay</button>
                <button style="padding:15px; border-radius:10px; border:1px solid #ddd;">NFC Tap</button>
            </div>
            <hr style="margin:20px 0; opacity:0.1;">
            <div class="row"><span>Stealth Mode</span> <input type="checkbox" style="width:auto;"></div>
            <div class="row"><span>Escrow Protection</span> <input type="checkbox" style="width:auto;"></div>
        </div>
    </div>

    <div id="tab-insights" class="tab-content">
        <div class="smart-hub">
            <h3>AI Financial Intelligence</h3>
            <div style="height:150px; background:#f1f5f9; border-radius:15px; display:flex; align-items:center; justify-content:center;">
                [AI Spending Graph Visualization]
            </div>
            <div class="sidebar-item">🔍 Subscription Leak Detector</div>
            <div class="sidebar-item">📊 Lifestyle Impact Score</div>
        </div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="smart-hub">
            <h3>Advanced Wealth Management</h3>
            <div class="stat-card" style="background:#fff7ed; color:#9a3412;">
                <b>Emergency Fund Builder</b><br>45% Progress
            </div>
            <div class="sidebar-item">🔒 Locked Savings (Time Capsule)</div>
            <div class="sidebar-item">🪙 Digital Gold Storage</div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="smart-hub">
            <h3>Advanced Protection</h3>
            <div class="row"><b>Panic Mode</b> <button style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:5px;">ACTIVATE</button></div>
            <hr>
            <label>Master Sound Engine (12 World Class)</label>
                <select id="snd_select" onchange="previewSnd()">
                    <option value="https://nfc-pro.com/sounds/coins.mp3">1. Royal Gold (Success)</option>
                    <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">2. Digital Chime (Notice)</option>
                    <option value="https://nfc-pro.com/sounds/alert.mp3">3. Cyber Alert (Warning)</option>
                    <option value="https://cdn.pixabay.com/download/audio/2021/08/04/audio_0624ed05f2.mp3">4. Security Ping (Alert)</option>
                    <option value="https://www.soundjay.com/buttons/beep-01a.mp3">5. Tech Click</option>
                </select>
            <div class="row"><span>Biometric Auth</span> <input type="checkbox" checked style="width:auto;"></div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="tab('dashboard', this)">
            <div class="nav-icon">🏛️</div><div class="nav-label">Vault</div>
        </div>
        <div class="nav-item" onclick="tab('payments', this)">
            <div class="nav-icon">💸</div><div class="nav-label">Pay</div>
        </div>
        <div class="nav-item" onclick="tab('insights', this)">
            <div class="nav-icon">📈</div><div class="nav-label">Insights</div>
        </div>
        <div class="nav-item" onclick="tab('vault', this)">
            <div class="nav-icon">💎</div><div class="nav-label">Wealth</div>
        </div>
        <div class="nav-item" onclick="tab('security', this)">
            <div class="nav-icon">🛡️</div><div class="nav-label">Secure</div>
        </div>
    </nav>

    <audio id="successSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

    <script>
// SCRIPT_ZONE
        function toggleMenu(open) {
            document.getElementById('sidebar').classList.toggle('active', open);
        }
        function tab(id, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            window.scrollTo(0,0);
        }
        function previewSnd() {
            const a = document.getElementById('successSound');
            a.src = document.getElementById('snd_select').value;
            a.play().catch(e => {});
        }
        async function updateStatus() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('dailyTotal').innerHTML = '<h3>💰</h3><div style="font-size:10px;">TODAY: KES '+data.todayTotal+'</div>';
            } catch(e) {}
        }
        setInterval(updateStatus, 5000);
    </script>
</body>
</html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");
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
    let tx = transactions.find(t => bodyText.includes(String(t.id)) || bodyText.includes(String(t.phone)));
    if (tx) { tx.status = "Successful ✅"; }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
