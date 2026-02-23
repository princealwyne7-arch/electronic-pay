const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

// BRAIN: AI PREDICTOR & STATUS TRANSLATION
const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes("success") || data.includes('"0"')) return { s: "Successful ✅", snd: "https://nfc-pro.com/sounds/coins.mp3" };
    if (data.includes("cancel") || data.includes("1032")) return { s: "Cancelled ❌", snd: "https://nfc-pro.com/sounds/alert.mp3" };
    if (data.includes("insufficient")) return { s: "Low Balance 💸", snd: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0624ed05f2.mp3" };
    return { s: "Processing... 🔄", snd: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" };
};

app.get('/api/status', (req, res) => {
    const successful = transactions.filter(t => t.status.includes('Successful'));
    const todayTotal = successful.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    const avgDaily = successful.length > 0 ? todayTotal / successful.length : 0;
    const forecast = (avgDaily * 7).toFixed(2);
    const healthScore = Math.min(1000, 300 + (successful.length * 20) + (todayTotal / 100));
    res.json({ transactions, todayTotal, healthScore, forecast });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay | Elite</title>
    <style>
        :root { --cobalt: #0047AB; --emerald: #28a745; --slate: #1e293b; --glass: rgba(255,255,255,0.9); }
        body { font-family: sans-serif; background: #f4f7fe; margin: 0; color: var(--slate); padding-bottom: 100px; }
        .top-nav { position: fixed; top: 0; width: 100%; height: 60px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-sizing: border-box; z-index: 2000; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .tab-content { display: none; padding: 80px 15px 20px 15px; }
        .active-tab { display: block; animation: fadeIn 0.3s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .bank-card { background: linear-gradient(135deg, #0047AB, #002f75); color: white; padding: 25px; border-radius: 20px; margin-bottom: 20px; }
        .smart-hub { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 15px; }
        .bottom-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; background: var(--glass); backdrop-filter: blur(15px); height: 70px; border-radius: 25px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 2000; }
        .nav-item { text-align: center; color: #94a3b8; cursor: pointer; font-size: 10px; font-weight: 800; }
        .nav-item.active { color: var(--cobalt); }
        .ai-badge { background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 5px; font-size: 9px; }
        input { width: 100%; padding: 14px; margin: 8px 0; border: 1px solid #e2e8f0; border-radius: 12px; box-sizing: border-box; }
        .btn-main { width: 100%; padding: 16px; background: var(--emerald); color: white; border: none; border-radius: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="top-nav">
        <div onclick="toggleMenu(true)">☰</div>
        <div style="font-weight: 900;">ELECTRONIC <span style="color:var(--emerald)">PAY</span></div>
        <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; border-radius:50%;">
    </div>

    <div id="tab-dashboard" class="tab-content active-tab">
        <div class="bank-card">
            <div style="font-size: 11px;">AI Health Index <span class="ai-badge" id="ai-score">Score: --</span></div>
            <div style="font-size: 28px; font-weight: bold; margin: 10px 0;" id="main-balance">KES 0.00</div>
            <div style="font-size: 11px;">7-Day Forecast: <span id="ai-forecast" style="color:#4ade80;">+KES 0.00</span></div>
        </div>
        <div class="smart-hub">
            <h3 style="font-size:14px; margin:0 0 10px 0;">Secure Transfer</h3>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="PIN" required>
                <input type="number" name="phone" placeholder="2547..." required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" class="btn-main">SEND STK PUSH</button>
            </form>
        </div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="smart-hub">
            <h3>Wealth Management</h3>
            <div style="background:#fff7ed; padding:15px; border-radius:15px; margin-bottom:10px;">
                <b style="color:#9a3412;">Emergency Fund Builder</b>
                <progress id="fund-progress" value="45" max="100" style="width:100%;"></progress>
                <small>45% to Goal (KES 50,000)</small>
            </div>
            <div style="padding:15px; border-bottom:1px solid #eee;">🔒 Time Capsule (Locked Savings)</div>
            <div style="padding:15px;">🪙 Digital Gold Storage</div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="smart-hub">
            <h3>Security & Sounds</h3>
            <select id="snd_select" onchange="previewSnd()" style="width:100%; padding:10px; border-radius:10px;">
                <option value="https://nfc-pro.com/sounds/coins.mp3">1. Royal Gold (Success)</option>
                <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">2. Digital Chime</option>
                <option value="https://nfc-pro.com/sounds/alert.mp3">3. Cyber Alert</option>
            </select>
            <div style="margin-top:20px; display:flex; justify-content:space-between;">
                <span>Panic Mode</span>
                <button onclick="alert('Panic Mode Armed')" style="background:#ef4444; color:white; border:none; border-radius:5px; padding:5px 10px;">ARM</button>
            </div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="tab('dashboard', this)">🏛️<br>VAULT</div>
        <div class="nav-item" onclick="tab('vault', this)">💎<br>WEALTH</div>
        <div class="nav-item" onclick="tab('security', this)">🛡️<br>SECURE</div>
    </nav>

    <audio id="successSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

    <script>
        function tab(id, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
        }
        function previewSnd() {
            const a = document.getElementById('successSound');
            a.src = document.getElementById('snd_select').value;
            a.play();
        }
        async function updateStatus() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('main-balance').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('ai-score').innerText = 'Score: ' + Math.floor(data.healthScore);
                document.getElementById('ai-forecast').innerText = '+KES ' + data.forecast;
            } catch(e) {}
        }
        setInterval(updateStatus, 5000); updateStatus();
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
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY }
        });
        transactions.unshift({ id: Date.now(), phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/callback', (req, res) => {
    const body = req.body;
    const info = translateStatus(body);
    let tx = transactions.find(t => JSON.stringify(body).includes(String(t.phone)));
    if (tx) { tx.status = info.s; }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
