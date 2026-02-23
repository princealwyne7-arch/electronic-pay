const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];
const PAYNECTA_KEY = "hmp_AegEZDHxA8uOAel2wp3ttkpK4FeBPwVa6bNiJcfE";
const PAYMENT_CODE = "PNT_957342";

app.get('/api/status', (req, res) => {
    const todayTotal = transactions.filter(t => t.status.includes('Successful')).reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        :root { --primary: #28a745; --bg: #f8fafc; }
        body { font-family: sans-serif; background: var(--bg); margin: 0; padding-bottom: 80px; }
        .top-banner { width: 100%; background: linear-gradient(135deg, #28a745, #1e7e34); padding: 40px 0; border-radius: 0 0 30px 30px; display: flex; justify-content: center; }
        .profile-pic { width: 80px; height: 80px; border-radius: 50%; border: 3px solid white; background: white; }
        .page { display: none; padding: 20px; }
        .page.active { display: block; }
        .card { background: white; padding: 20px; border-radius: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 15px; }
        .btn-send { width: 100%; padding: 15px; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: bold; font-size: 16px; cursor: pointer; }
        input, select { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box; }
        .calc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .calc-grid button { padding: 20px; border-radius: 12px; border: none; background: #334155; color: white; font-size: 18px; }
        .nav-bar { position: fixed; bottom: 0; width: 100%; background: white; display: flex; border-top: 1px solid #eee; padding: 10px 0; }
        .nav-item { flex: 1; text-align: center; color: #94a3b8; font-size: 11px; cursor:pointer; }
        .nav-item.active { color: var(--primary); }
    </style>
</head>
<body>
    <div class="top-banner">
        <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
    </div>

    <div id="home" class="page active">
        <h2>Electronic Pay</h2>
        <div class="card">
            <div id="dailyTotal" style="color:var(--primary); font-weight:bold; margin-bottom:10px;">Today: KES 0</div>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Manager PIN" required>
                <input type="number" name="phone" placeholder="2547..." required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" class="btn-send">SEND STK PUSH</button>
            </form>
        </div>
    </div>

    <div id="activity" class="page">
        <h2>Activity</h2>
        <div id="history-list" class="card">No activity yet...</div>
    </div>

    <div id="calc" class="page">
        <h2>Calculator</h2>
        <div class="card" style="background:#1e293b">
            <input type="text" id="cdis" readonly value="0" style="background:transparent; color:#10b981; border:none; text-align:right; font-size:32px; width:100%; font-family:monospace;">
            <div class="calc-grid">
                <button onclick="cCl()">C</button><button onclick="cIn('/')">/</button><button onclick="cIn('*')">x</button><button onclick="cIn('-')">-</button>
                <button onclick="cIn('7')">7</button><button onclick="cIn('8')">8</button><button onclick="cIn('9')">9</button><button onclick="cIn('+')">+</button>
                <button onclick="cIn('4')">4</button><button onclick="cIn('5')">5</button><button onclick="cIn('6')">6</button><button onclick="cRes()">=</button>
                <button onclick="cIn('1')">1</button><button onclick="cIn('2')">2</button><button onclick="cIn('3')">3</button><button onclick="cIn('0')">0</button>
            </div>
        </div>
    </div>

    <div id="more" class="page">
        <h2>Advanced Tools</h2>
        <div class="card">
            <p style="font-weight:bold; color:var(--primary);">🔔 Sound Notifications (12+ Library)</p>
            <select id="successSelect">
                <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">Classic Chime ✅</option>
                <option value="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3">Cash Register 💰</option>
            </select>
            <select id="errorSelect">
                <option value="https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3">Titititi Alert ⚠️</option>
            </select>
        </div>
    </div>

    <nav class="nav-bar">
        <div class="nav-item active" onclick="sP('home', this)">🏠<br>Home</div>
        <div class="nav-item" onclick="sP('activity', this)">📊<br>Activity</div>
        <div class="nav-item" onclick="sP('calc', this)">🧮<br>Calc</div>
        <div class="nav-item" onclick="sP('more', this)">⚙️<br>More</div>
    </nav>

    <script>
        function sP(id, el) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            el.classList.add('active');
        }
        function cIn(v) { let d=document.getElementById('cdis'); if(d.value=='0') d.value=v; else d.value+=v; }
        function cCl() { document.getElementById('cdis').value='0'; }
        function cRes() { try{ let d=document.getElementById('cdis'); d.value=eval(d.value); }catch(e){ d.value='Error'; } }
        async function update() {
            const res = await fetch('/api/status');
            const data = await res.json();
            document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
        }
        setInterval(update, 3000);
    </script>
</body>
</html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: PAYMENT_CODE, mobile_number: phone, amount: amount, email: "admin@pay.com"
        }, { headers: { 'X-API-Key': PAYNECTA_KEY } });
        transactions.unshift({ id: Date.now(), phone, amount, status: 'Processing... 🔄' });
        res.redirect('/');
    } catch (e) { res.status(500).send("API Error: " + e.message); }
});

app.listen(process.env.PORT || 3000);
