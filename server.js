const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

let transactions = []; 
const PAYNECTA_KEY = "hmp_AegEZDHxA8uOAel2wp3ttkpK4FeBPwVa6bNiJcfE";
const PAYMENT_CODE = "PNT_957342";

const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const todayTotal = transactions.filter(t => t.status.includes('Successful')).reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal });
});

app.post('/upload-logo', upload.single('logo'), (req, res) => {
    if (req.file) {
        const target = path.join(__dirname, 'uploads/logo.png');
        if (fs.existsSync(target)) fs.unlinkSync(target);
        fs.renameSync(req.file.path, target);
    }
    res.redirect('/');
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root { --primary: #28a745; --bg: #f8fafc; --card: #ffffff; --text: #1e293b; --sub: #64748b; }
        body { font-family: sans-serif; background: var(--bg); margin: 0; color: var(--text); transition: 0.3s; }
        .top-banner { width: 100%; background: linear-gradient(135deg, #28a745, #1e7e34); padding: 40px 0; border-radius: 0 0 30px 30px; display: flex; justify-content: center; position: fixed; top: 0; z-index: 5; }
        .profile-pic { width: 90px; height: 90px; border-radius: 50%; border: 4px solid white; object-fit: cover; background: white; }
        
        .tab-content { display: none; padding: 140px 15px 100px 15px; animation: fadeIn 0.3s; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .container, .history-card { background: var(--card); padding: 25px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin: 0 auto 15px auto; box-sizing: border-box; }
        input, select { width: 100%; padding: 14px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
        .btn-send { width: 100%; padding: 16px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
        
        .nav-bar { position: fixed; bottom: 0; width: 100%; background: white; display: flex; justify-content: space-around; padding: 12px 0; border-top: 1px solid #eee; z-index: 1000; }
        .nav-item { color: var(--sub); font-size: 11px; text-decoration: none; text-align: center; cursor: pointer; }
        .nav-item.active { color: var(--primary); font-weight: bold; }
        
        .header-caps { cursor: pointer; color: var(--text); display: flex; justify-content: space-between; align-items: center; text-transform: uppercase; font-size: 16px; margin: 0; }
        .collapsible { display: none; text-align: left; border-top: 1px solid #eee; margin-top: 15px; padding-top: 15px; }
        .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 12px 20px; border-radius: 10px; z-index: 2000; display: none; }
    </style>
</head>
<body>
    <div id="toast" class="toast"></div>
    <div class="top-banner">
        <img src="/uploads/logo.png?v=${Date.now()}" onerror="this.src='https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png'" class="profile-pic">
    </div>

    <div id="home" class="tab-content active-tab">
        <div class="container">
            <h2 style="margin:0 0 10px 0;">Electronic Pay</h2>
            <div id="dailyTotal" style="background:#e8f5e9; padding:10px; border-radius:10px; color:#2e7d32; font-weight:bold; margin-bottom:15px;">Today: KES 0</div>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Manager PIN" required>
                <input type="number" name="phone" placeholder="2547..." required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" class="btn-send">SEND STK PUSH</button>
            </form>
        </div>
    </div>

    <div id="activity" class="tab-content">
        <div class="history-card">
            <h3 style="margin:0 0 15px 0;">Live Activity</h3>
            <div id="history-list">No transactions yet...</div>
        </div>
    </div>

    <div id="settings" class="tab-content">
        <div class="history-card">
            <h3 class="header-caps" onclick="toggleSection('snd-area')">Notifications & Sounds <span>▼</span></h3>
            <div id="snd-area" class="collapsible">
                <label style="font-size:11px; color:var(--sub);">SUCCESS SOUND</label>
                <select id="snd_success">
                    <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">Chime</option>
                    <option value="https://nfc-pro.com/sounds/coins.mp3">Cash Register</option>
                </select>
                <label style="display:flex; justify-content:space-between; font-size:13px; margin:10px 0;">Login Alerts <input type="checkbox" checked></label>
                <label style="display:flex; justify-content:space-between; font-size:13px; margin:10px 0;">Transaction Toasts <input type="checkbox" id="toastOn" checked></label>
                <button onclick="playSnd()" style="width:100%; padding:10px; border:none; border-radius:10px; background:#f1f5f9;">Test Audio Engine</button>
            </div>
        </div>

        <div class="history-card">
            <h3 class="header-caps" onclick="toggleSection('pref-area')">Regional & App Preferences <span>▼</span></h3>
            <div id="pref-area" class="collapsible">
                <label style="font-size:11px; color:var(--sub);">LANGUAGE</label>
                <select><option>English (UK)</option><option>Kiswahili</option></select>
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <span>Dark Mode</span>
                    <input type="checkbox" onchange="document.body.style.filter = this.checked ? 'invert(1) hue-rotate(180deg)' : 'none'">
                </div>
                <button class="btn-send" style="padding:10px; font-size:14px;">SAVE SETTINGS</button>
            </div>
        </div>

        <div class="history-card">
            <p style="font-size:12px; margin:0 0 10px 0;"><b>Change Branding Photo</b></p>
            <form action="/upload-logo" method="POST" enctype="multipart/form-data">
                <input type="file" name="logo" accept="image/*" onchange="this.form.submit()">
            </form>
        </div>
    </div>

    <nav class="nav-bar">
        <div class="nav-item active" onclick="showTab('home', this)">🏠<br>Home</div>
        <div class="nav-item" onclick="showTab('activity', this)">📊<br>Activity</div>
        <div class="nav-item" onclick="showTab('settings', this)">⚙️<br>Settings</div>
    </nav>

    <audio id="audio" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"></audio>

    <script>
        function showTab(id, el) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById(id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
        }
        function toggleSection(id) {
            const el = document.getElementById(id);
            el.style.display = (el.style.display === 'block') ? 'none' : 'block';
        }
        function playSnd() { document.getElementById('audio').play().catch(e => {}); }
        function showToast(m) {
            if(!document.getElementById('toastOn').checked) return;
            const t = document.getElementById('toast');
            t.innerText = m; t.style.display = 'block';
            setTimeout(() => t.style.display = 'none', 3000);
        }

        let lastTx = 0;
        async function refresh() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
                if(data.transactions.length > lastTx) {
                    if(lastTx > 0) { playSnd(); showToast('New Transaction Detected!'); }
                    lastTx = data.transactions.length;
                }
                document.getElementById('history-list').innerHTML = data.transactions.map(t => \`
                    <div style="border-bottom:1px solid #eee; padding:10px 0; text-align:left; font-size:13px;">
                        <b>\${t.phone}</b> <span style="float:right; color:#28a745;">KES \${t.amount}</span><br>
                        <small style="color:#94a3b8;">\${t.time} - \${t.status}</small>
                    </div>\`).join('') || 'No activity';
            } catch(e) {}
        }
        setInterval(refresh, 3000); refresh();
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
            code: PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': PAYNECTA_KEY } });
        const tid = response.data.merchant_request_id || Date.now();
        transactions.unshift({ id: tid, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.redirect('/'); }
});

app.post('/callback', (req, res) => {
    const data = JSON.stringify(req.body).toLowerCase();
    let tx = transactions.find(t => data.includes(String(t.id)) || data.includes(String(t.phone)));
    if (tx) {
        if (data.includes('success') || data.includes('"0"')) tx.status = 'Successful ✅';
        else if (data.includes('cancel') || data.includes('1032')) tx.status = 'Cancelled ❌';
        else tx.status = 'Failed ⚠️';
    }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
