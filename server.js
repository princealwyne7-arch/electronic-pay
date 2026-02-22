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
                .header-tools { position: absolute; top: 25px; right: 20px; display: flex; gap: 15px; z-index: 1001; }
                .tool-icon { color: white; font-size: 22px; cursor: pointer; }
                #search-box { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); width: 90%; display: none; z-index: 1000; }
                .s-input { width: 100%; padding: 12px; border-radius: 20px; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

                :root { --primary: #28a745; --bg: #f8fafc; --text: #1e293b; --dark: #1e293b; }
                body { font-family: sans-serif; background: var(--bg); margin: 0; padding-bottom: 90px; overflow-x: hidden; }
                
                
                .header-tools { position: absolute; top: 25px; right: 20px; display: flex; gap: 15px; z-index: 1001; }
                .tool-icon { color: white; font-size: 22px; cursor: pointer; transition: 0.3s; }
                .tool-icon:active { transform: scale(0.9); opacity: 0.7; }
                
                #search-container { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); width: 90%; display: none; z-index: 1000; animation: slideDown 0.3s ease; }
                @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }
                .search-input { width: 100%; padding: 12px 20px; border-radius: 25px; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.1); outline: none; font-size: 14px; }

                .top-banner { width: 100%; background: linear-gradient(135deg, #28a745, #1e7e34); padding: 45px 0; border-radius: 0 0 35px 35px; display: flex; justify-content: center; position: relative; }
                .profile-pic { width: 90px; height: 90px; border-radius: 50%; border: 4px solid white; object-fit: cover; background: white; }

                /* Menu & Sidebar */
                .menu-btn { position: absolute; top: 25px; left: 20px; z-index: 1001; cursor: pointer; color: white; font-size: 24px; }
                
                .sidebar-header { background: linear-gradient(135deg, #28a745, #1e7e34); padding: 30px 20px; color: white; margin: -30px -20px 20px -20px; border-radius: 0 0 20px 0; }
                .sidebar-section { margin-bottom: 25px; }
                .sidebar-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: block; font-weight: 700; }
                .sidebar-item { display: flex; align-items: center; padding: 12px 0; color: #334155; text-decoration: none; font-size: 14px; border-bottom: 1px solid #f8fafc; cursor: pointer; }
                .sidebar-item span { margin-right: 15px; font-size: 18px; width: 25px; text-align: center; }
                .sidebar-item:active { background: #f1f5f9; }

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
            <div class="header-tools">
                <div class="tool-icon" onclick="toggleSearch()">🔍</div>
                <div class="tool-icon" onclick="sP('activity', document.querySelectorAll('.nav-item')[1])">🔔</div>
            </div>
            <div id="search-container">
                <input type="text" class="search-input" id="searchQuery" placeholder="Search phone or amount..." onkeyup="filterHistory()">
            </div>

            <div class="menu-btn" onclick="toggleMenu()">☰</div>
            <div class="overlay" id="overlay" onclick="toggleMenu()"></div>
            
            
            <div class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <p style="margin:0; opacity:0.8; font-size:12px;">Good Day,</p>
                    <b style="font-size:18px;">Manager Account</b>
                    <div style="font-size:10px; margin-top:5px; background:rgba(255,255,255,0.2); display:inline-block; padding:2px 8px; border-radius:10px;">Premium Member</div>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-label">My Bank</span>
                    <a class="sidebar-item"><span>👤</span> Personal Profile</a>
                    <a class="sidebar-item"><span>📄</span> E-Statements</a>
                    <a class="sidebar-item"><span>💳</span> Card Management</a>
                    <a class="sidebar-item"><span>🏦</span> Linked Accounts</a>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-label">Security</span>
                    <a class="sidebar-item"><span>🔐</span> Security PIN</a>
                    <a class="sidebar-item"><span>🤳</span> Biometric Login</a>
                    <a class="sidebar-item"><span>📱</span> Trusted Devices</a>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-label">Preferences</span>
                    <a class="sidebar-item"><span>🌍</span> Language & Region</a>
                    <a class="sidebar-item"><span>🌓</span> Dark Mode (Auto)</a>
                    <a class="sidebar-item"><span>💰</span> Default Currency</a>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-label">Support</span>
                    <a class="sidebar-item"><span>💬</span> Live Support</a>
                    <a class="sidebar-item"><span>📍</span> Branch Locator</a>
                    <a class="sidebar-item"><span>ℹ️</span> About Electronic Pay</a>
                </div>

                <div style="margin-top: 40px;">
                    <a class="sidebar-item" style="color: #ef4444; border:none;"><span>🚪</span> Sign Out</a>
                </div>
            </div>


            <div class="top-banner">
                <img src="/uploads/logo.png?v=${Date.now()}" onerror="this.src='https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png'" class="profile-pic">
            </div>

            
            <div id="home" class="page active">
                <h2 style="margin: 10px 0 20px 0;">Electronic Pay</h2>
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
                
                <div class="card" style="margin-top: 15px; border: 1px solid #e2e8f0;">
                    <p style="color: var(--primary); font-weight: bold; margin-bottom: 12px; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">🔔</span> Sound Notifications
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: #f1f5f9; padding: 10px; border-radius: 10px;">
                        <span style="font-size: 14px;">Master Sound Switch</span>
                        <input type="checkbox" id="soundToggle" checked style="width: auto; margin: 0; transform: scale(1.2);">
                    </div>
                    
                    <div style="text-align: left;">
                        <label style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Success Tone (Paid)</label>
                        <select id="successSelect" style="margin-bottom: 15px; background: #fff;">
                            <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">Classic Chime ✅</option>
                            <option value="https://cdn.pixabay.com/audio/2022/03/10/audio_c352c858c2.mp3">Digital Payment 📱</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3">Cash Register 💰</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3">Coins Drop 🪙</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2633/2633-preview.mp3">Success Bell 🔔</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3">Win Tone 🏆</option>
                        </select>

                        <label style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Alert Tone (Titititi/Fail)</label>
                        <select id="errorSelect" style="background: #fff;">
                            <option value="https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3">Titititi Alert ⚠️</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3">System Error ❌</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3">Short Beep 📟</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3">Triple Alert 🚨</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3">Buzz Fail 👎</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3">Urgent Ping 📍</option>
                        </select>
                    </div>
                </div>

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
                
                let playedIds = new Set();
                function playSnd(type) {
                    if (!document.getElementById('soundToggle').checked) return;
                    let url = type === 'ok' ? document.getElementById('successSelect').value : document.getElementById('errorSelect').value;
                    new Audio(url).play().catch(() => {});
                }

                
                function toggleSearch() {
                    const sc = document.getElementById('search-container');
                    sc.style.display = sc.style.display === 'block' ? 'none' : 'block';
                    if(sc.style.display === 'block') document.getElementById('searchQuery').focus();
                }

                function filterHistory() {
                    const q = document.getElementById('searchQuery').value.toLowerCase();
                    const rows = document.querySelectorAll('.status-row-container'); // We will tag rows with this class
                    rows.forEach(row => {
                        row.style.display = row.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
                    });
                }

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
                        
                        data.transactions.forEach(t => {
                            if (!playedIds.has(t.id)) {
                                if (t.status.includes('Successful')) { playSnd('ok'); playedIds.add(t.id); }
                                else if (t.status.includes('Cancelled') || t.status.includes('Failed')) { playSnd('err'); playedIds.add(t.id); }
                            }
                        });

                        document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
                        document.getElementById('history-list').innerHTML = data.transactions.map(t => `<div class="status-row-container" style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:10px 0;"> 
                            \`<div style="border-bottom:1px solid #eee; padding:10px 0; display:flex; justify-content:space-between">
                                <span><b>\${t.phone}</b><br><small>\${t.status}</small></span>
                                <b>KES \${t.amount}</b>
                            </div>\`
                         + "</div>").join('') || 'No activity';
                    } catch(e) {}
                }
                setInterval(updateStatus, 3000);
            
                function tglS() { 
                    let b = document.getElementById('search-box'); 
                    b.style.display = b.style.display === 'block' ? 'none' : 'block'; 
                }
                function fltr() {
                    let q = document.getElementById('sq').value.toLowerCase();
                    document.querySelectorAll('#history-list div').forEach(r => {
                        r.style.display = r.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
                    });
                }

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
    const bodyText = JSON.stringify(req.body).toLowerCase();
    // Find the transaction by ID or Phone
    let tx = transactions.find(t => bodyText.includes(String(t.id)) || bodyText.includes(String(t.phone)));
    
    if (tx) {
        // Only "0" or "success" in the ResultCode field means the money moved
        // We look for common M-Pesa failure codes
        if (bodyText.includes('"resultcode":0') || bodyText.includes('"status":"success"') || bodyText.includes('"0"')) {
            tx.status = 'Successful ✅';
            playSnd('ok'); 
        } else if (bodyText.includes('1032') || bodyText.includes('cancel')) {
            tx.status = 'Cancelled ❌';
            playSnd('err');
        } else if (bodyText.includes('1') || bodyText.includes('insufficient')) {
            tx.status = 'Low Balance 💸';
            playSnd('err');
        } else if (bodyText.includes('2001') || bodyText.includes('wrong')) {
            tx.status = 'Wrong PIN 🔑';
            playSnd('err');
        } else {
            tx.status = 'Failed ❌';
            playSnd('err');
        }
    }
    res.sendStatus(200);});

app.listen(process.env.PORT || 3000);
