const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                :root { --primary: #28a745; --bg: #f8fafc; --text: #1e293b; --dark: #1e293b; }
                body { font-family: sans-serif; background: var(--bg); margin: 0; padding-bottom: 90px; overflow-x: hidden; }
                
                .top-banner { width: 100%; background: linear-gradient(135deg, #28a745, #1e7e34); padding: 45px 0; border-radius: 0 0 35px 35px; display: flex; justify-content: center; position: relative; }
                .profile-pic { width: 90px; height: 90px; border-radius: 50%; border: 4px solid white; object-fit: cover; background: white; }

                /* Menu & Sidebar */
                .menu-btn { position: absolute; top: 25px; left: 20px; z-index: 1001; cursor: pointer; color: white; font-size: 24px; }
                .sidebar { position: fixed; top: 0; left: -280px; width: 280px; height: 100%; background: white; z-index: 2000; transition: 0.3s; box-shadow: 10px 0 30px rgba(0,0,0,0.1); padding: 30px 20px; box-sizing: border-box; }
                .sidebar.open { left: 0; }
                .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 1500; display: none; backdrop-filter: blur(3px); }
                .overlay.show { display: block; }

                /* Navigation & Pages */
                .page { display: none; padding: 20px; animation: fadeIn 0.3s ease; }
                .page.active { display: block; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                .card { background: white; padding: 20px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
                .total-box { background: #e8f5e9; padding: 15px; border-radius: 12px; color: #1b5e20; font-weight: bold; margin-bottom: 15px; }
                
                input, select { width: 100%; padding: 14px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
                .btn-send { width: 100%; padding: 16px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; }

                /* Calculator UI */
                .calc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                .calc-grid button { padding: 15px; border-radius: 10px; border: none; background: #334155; color: white; font-size: 18px; }
                .calc-grid button.op { background: var(--primary); }

                /* Bottom Nav */
                .nav-bar { position: fixed; bottom: 0; width: 100%; background: white; display: flex; padding: 10px 0 25px 0; border-top: 1px solid #eee; z-index: 1000; }
                .nav-item { flex: 1; text-align: center; color: #94a3b8; text-decoration: none; font-size: 11px; }
                .nav-item.active { color: var(--primary); }
            </style>
        </head>
        <body>
            <div class="menu-btn" onclick="toggleMenu()">☰</div>
            <div class="overlay" id="overlay" onclick="toggleMenu()"></div>
            
            <div class="sidebar" id="sidebar">
                <h3>Account</h3>
                <p>👤 Profile</p>
                <p>🔐 Security</p>
                <hr>
                <p style="color:red">🚪 Logout</p>
            </div>

            <div class="top-banner">
                <img src="/uploads/logo.png?v=${Date.now()}" onerror="this.src='https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png'" class="profile-pic">
            </div>

            <div id="home" class="page active">
                <h2>Electronic Pay</h2>
                <div class="card">
                    <div id="dailyTotal" class="total-box">Today: KES 0</div>
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
                <div id="history-list" class="card">No activity...</div>
            </div>

            <div id="calc" class="page">
                <h2>Calculator</h2>
                <div class="card" style="background:#1e293b">
                    <input type="text" id="cdis" readonly value="0" style="background:#0f172a; color:#10b981; border:none; text-align:right; font-size:24px;">
                    <div class="calc-grid">
                        <button onclick="cCl()">C</button><button onclick="cIn('/')" class="op">÷</button><button onclick="cIn('*')" class="op">×</button><button onclick="cIn('-')" class="op">-</button>
                        <button onclick="cIn('7')">7</button><button onclick="cIn('8')">8</button><button onclick="cIn('9')">9</button><button onclick="cIn('+')" class="op">+</button>
                        <button onclick="cIn('4')">4</button><button onclick="cIn('5')">5</button><button onclick="cIn('6')">6</button><button onclick="cIn('=')" style="grid-row: span 2; background:#10b981" onclick="cRes()">=</button>
                        <button onclick="cIn('1')">1</button><button onclick="cIn('2')">2</button><button onclick="cIn('3')">3</button>
                    </div>
                </div>
            </div>

            <div id="more" class="page">
                <h2>Settings</h2>
                <div class="card">
                    <p>Change Logo:</p>
                    <form action="/upload-logo" method="POST" enctype="multipart/form-data">
                        <input type="file" name="logo" onchange="this.form.submit()">
                    </form>
                    <hr>
                    <p>Sound: <input type="checkbox" id="sOn" checked style="width:auto"></p>
                </div>
            </div>

            <nav class="nav-bar">
                <a href="#" class="nav-item active" onclick="sP('home', this)">🏠<br>Home</a>
                <a href="#" class="nav-item" onclick="sP('activity', this)">📊<br>Activity</a>
                <a href="#" class="nav-item" onclick="sP('calc', this)">🧮<br>Calc</a>
                <a href="#" class="nav-item" onclick="sP('more', this)">⚙️<br>More</a>
            </nav>

            <script>
                function sP(id, el) {
                    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    document.getElementById(id).classList.add('active');
                    el.classList.add('active');
                }
                function toggleMenu() {
                    document.getElementById('sidebar').classList.toggle('open');
                    document.getElementById('overlay').classList.toggle('show');
                }
                function cIn(v) { let d=document.getElementById('cdis'); if(v=='=') { try{d.value=eval(d.value)}catch(e){d.value='Error'} } else { if(d.value=='0') d.value=v; else d.value+=v; } }
                function cCl() { document.getElementById('cdis').value='0'; }

                async function updateStatus() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();
                        document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
                        document.getElementById('history-list').innerHTML = data.transactions.map(t => 
                            \`<div style="border-bottom:1px solid #eee; padding:10px 0; display:flex; justify-content:space-between">
                                <span><b>\${t.phone}</b><br><small>\${t.status}</small></span>
                                <b>KES \${t.amount}</b>
                            </div>\`
                        ).join('') || 'No activity';
                    } catch(e) {}
                }
                setInterval(updateStatus, 3000);
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
            code: PAYMENT_CODE, mobile_number: phone, amount: amount, email: "princealwyne7@gmail.com",
            callback_url: "https://" + req.get('host') + "/callback"
        }, { headers: { 'X-API-Key': PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        const tid = response.data.merchant_request_id || Date.now();
        transactions.unshift({ id: tid, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/callback', (req, res) => {
    const b = JSON.stringify(req.body).toLowerCase();
    let tx = transactions.find(t => b.includes(String(t.id)) || b.includes(String(t.phone)));
    if (tx) {
        if (b.includes('success') || b.includes('0')) tx.status = 'Successful ✅';
        else if (b.includes('cancel')) tx.status = 'Cancelled ❌';
        else tx.status = 'Failed ❌';
    }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
