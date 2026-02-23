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
    const logoUrl = "/uploads/logo.png?v=" + Date.now();
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        :root { --primary: #28a745; --bg: #f8fafc; --card: #ffffff; --text: #1e293b; --sub: #64748b; }
        body { font-family: sans-serif; background: var(--bg); margin: 0; color: var(--text); overflow-x: hidden; }
        .top-banner { position: fixed; top: 0; width: 100%; height: 130px; background: linear-gradient(135deg, #28a745, #1e7e34); border-radius: 0 0 30px 30px; display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .profile-pic { width: 85px; height: 85px; border-radius: 50%; border: 4px solid white; object-fit: cover; background: #fff; }
        .nav-bar { position: fixed; bottom: 0; width: 100%; background: white; display: flex; justify-content: space-around; padding: 15px 0; border-top: 1px solid #eee; z-index: 1000; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
        .tab-content { display: none; padding: 150px 15px 100px 15px; min-height: 100vh; box-sizing: border-box; }
        .active-tab { display: block; }
        .container, .history-card { background: var(--card); padding: 20px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin: 0 auto 15px auto; box-sizing: border-box; }
        .header-caps { cursor: pointer; color: var(--text); display: flex; justify-content: space-between; align-items: center; text-transform: uppercase; font-size: 14px; font-weight: 800; margin: 0; padding: 5px 0; }
        .collapsible { display: none; text-align: left; border-top: 1px solid #f1f5f9; margin-top: 15px; padding-top: 15px; }
        input, select { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 15px; background: white; }
        .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px; }
        .nav-item { color: var(--sub); font-size: 10px; font-weight: bold; text-align: center; cursor: pointer; }
        .nav-item.active { color: var(--primary); }
        .theme-dot { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid #ddd; }
    </style>
</head>
<body>
    <div class="top-banner"><img src="${logoUrl}" onerror="this.src='https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png'" class="profile-pic"></div>
    
    <div id="home" class="tab-content active-tab">
        <div class="container">
            <h2>Electronic Pay</h2>
            <div id="dailyTotal" style="background:#e8f5e9; padding:8px; border-radius:8px; color:#2e7d32; font-weight:bold; margin-bottom:15px;">Today: KES 0</div>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Manager PIN" required>
                <input type="number" name="phone" placeholder="2547..." required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" style="width:100%; padding:15px; background:var(--primary); color:white; border:none; border-radius:10px; font-weight:bold;">SEND STK PUSH</button>
            </form>
        </div>
    </div>

    <div id="activity" class="tab-content">
        <div class="history-card"><h3>Live Activity</h3><div id="history-list">No data...</div></div>
    </div>

    <div id="settings" class="tab-content">
        <div class="history-card">
            <h3 class="header-caps" onclick="toggle('snd-box')">NOTIFICATIONS & SOUNDS <span>▼</span></h3>
            <div id="snd-box" class="collapsible">
                <div class="row"><b>Master Sound Switch</b> <input type="checkbox" id="master_snd" checked></div>
                <label style="font-size:10px; color:var(--sub);">SUCCESS SOUND (12 WORLD CLASS)</label>
                <select id="snd_select" onchange="previewSnd()">
                    <option value="https://nfc-pro.com/sounds/coins.mp3">1. Royal Gold (Default)</option>
                    <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">2. Digital Chime</option>
                    <option value="https://nfc-pro.com/sounds/success.mp3">3. Modern Beep</option>
                    <option value="https://cdn.pixabay.com/download/audio/2021/08/04/audio_bbdec3a6ce.mp3">4. Crystal Ping</option>
                    <option value="https://cdn.pixabay.com/download/audio/2022/03/15/audio_731478144b.mp3">5. Tech Sweep</option>
                    <option value="https://cdn.pixabay.com/download/audio/2021/08/04/audio_0624ed05f2.mp3">6. Notification Bell</option>
                    <option value="https://nfc-pro.com/sounds/cash.mp3">7. ATM Dispense</option>
                    <option value="https://cdn.pixabay.com/download/audio/2022/03/10/audio_c36394548d.mp3">8. Zen Harmony</option>
                    <option value="https://cdn.pixabay.com/download/audio/2021/08/09/audio_884068305c.mp3">9. Success Pulse</option>
                    <option value="https://nfc-pro.com/sounds/alert.mp3">10. Cyber Alert</option>
                    <option value="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3">11. Minimal Pop</option>
                    <option value="https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b8265a6e.mp3">12. Galactic Ping</option>
                </select>
                <div class="row"><b>Master Notification Switch</b> <input type="checkbox" id="master_notif" checked></div>
                <div class="row"><span>Transaction Alerts (Dr/Cr)</span><input type="checkbox" class="notif-item" checked></div>
                <div class="row"><span>Low Balance Alerts</span><input type="checkbox" class="notif-item" checked></div>
                <div class="row"><span>Login Alerts</span><input type="checkbox" class="notif-item" checked></div>
                <div class="row"><span>Bill Due Reminders</span><input type="checkbox" class="notif-item"></div>
                <div class="row"><span>Marketing Preferences</span><input type="checkbox" class="notif-item"></div>
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                    <span>SMS <input type="checkbox" checked></span>
                    <span>Email <input type="checkbox"></span>
                    <span>Push <input type="checkbox" checked></span>
                </div>
            </div>
                <div class="row"><span>Low Balance Alerts</span><input type="checkbox" checked></div>
                <div class="row"><span>Login Alerts</span><input type="checkbox" checked></div>
                <div class="row"><span>Bill Due Reminders</span><input type="checkbox"></div>
                <div class="row"><span>Marketing Preferences</span><input type="checkbox"></div>
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                    <span>SMS <input type="checkbox" checked></span>
                    <span>Email <input type="checkbox"></span>
                    <span>Push <input type="checkbox" checked></span>
                </div>
            </div>
        </div>

        <div class="history-card">
            <h3 class="header-caps" onclick="toggle('reg-box')">REGIONAL & APP PREFERENCES <span>▼</span></h3>
            <div id="reg-box" class="collapsible">
                <label style="font-size:10px; color:var(--sub);">LANGUAGE SELECTION</label>
                <select><option>English (UK)</option><option>Kiswahili</option></select>
                <div class="row"><span>Dark Mode / Light Mode</span><input type="checkbox" onchange="setDark(this.checked)"></div>
                <label style="font-size:10px; color:var(--sub);">CURRENCY DISPLAY FORMAT</label>
                <select><option>KES (Shilling)</option><option>USD ($)</option></select>
                <label style="font-size:10px; color:var(--sub);">TIME ZONE</label>
                <select><option>(GMT+03:00) Nairobi</option></select>
                <div class="row"><span>Accessibility Settings</span><input type="checkbox"></div>
                <label style="font-size:10px; color:var(--sub);">APP THEME</label>
                <div style="display:flex; gap:10px; margin-top:5px;">
                    <div class="theme-dot" style="background:#28a745;"></div>
                    <div class="theme-dot" style="background:#007bff;"></div>
                    <div class="theme-dot" style="background:#6f42c1;"></div>
                </div>
            </div>
        </div>

        <div class="history-card">
            <form action="/upload-logo" method="POST" enctype="multipart/form-data">
                <label style="font-size:12px;">Branding Photo:</label>
                <input type="file" name="logo" accept="image/*" onchange="this.form.submit()">
            </form>
        </div>
    </div>

    <nav class="nav-bar">
        <div class="nav-item active" onclick="tab('home', this)">🏠<br>Home</div>
        <div class="nav-item" onclick="tab('activity', this)">📊<br>Activity</div>
        <div class="nav-item" onclick="tab('settings', this)">⚙️<br>Settings</div>
    </nav>
    <audio id="player" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"></audio>

    <script>
        function tab(id, el) {
            document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active-tab'); });
            document.getElementById(id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
            el.classList.add('active');
            window.scrollTo(0,0);
        }
        function toggle(id) {
            var d = document.getElementById(id);
            d.style.display = (d.style.display === 'block') ? 'none' : 'block';
        }
        function previewSnd() {
            var a = document.getElementById('player');
            a.src = document.getElementById('snd_select').value;
            a.play().catch(function(e) {});
        }
        function setDark(on) {
            document.body.style.background = on ? '#0f172a' : '#f8fafc';
            document.querySelectorAll('.container, .history-card, .nav-bar').forEach(function(c) {
                c.style.background = on ? '#1e293b' : '#fff';
                c.style.color = on ? '#f8fafc' : '#1e293b';
            });
        }
        async function sync() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
                var list = data.transactions.map(function(t) {
                    return '<div style="border-bottom:1px solid #eee; padding:10px 0; font-size:12px; text-align:left;">' +
                           '<b>' + t.phone + '</b> <span style="float:right; color:#28a745;">KES ' + t.amount + '</span><br>' +
                           '<small style="color:#94a3b8;">' + t.time + ' - ' + t.status + '</small></div>';
                }).join('') || 'No Transactions';
                document.getElementById('history-list').innerHTML = list;
            } catch(e) {}
        }
        setInterval(sync, 3000); sync();
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
