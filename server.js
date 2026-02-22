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
                :root { --primary: #28a745; --bg: #f8fafc; --text: #1e293b; }
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); margin: 0; padding-bottom: 90px; color: var(--text); overflow-x: hidden; }
                
                /* Top Branding */
                .top-banner { width: 100%; background: linear-gradient(135deg, #28a745, #1e7e34); padding: 45px 0; border-radius: 0 0 35px 35px; display: flex; justify-content: center; position: relative; }
                .profile-pic { width: 90px; height: 90px; border-radius: 50%; border: 4px solid white; object-fit: cover; box-shadow: 0 8px 20px rgba(0,0,0,0.15); background: white; }

                /* Main Content Area */
                .page { display: none; padding: 20px; animation: fadeIn 0.3s ease; }
                .page.active { display: block; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .card { background: white; padding: 25px; border-radius: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
                .total-box { background: #e8f5e9; padding: 15px; border-radius: 16px; margin-bottom: 20px; color: #1b5e20; font-weight: 700; font-size: 1.2rem; }
                
                input { width: 100%; padding: 16px; margin-bottom: 12px; border: 1.5px solid #e2e8f0; border-radius: 14px; font-size: 16px; box-sizing: border-box; outline: none; transition: 0.3s; }
                input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(40, 167, 69, 0.1); }
                .btn-send { width: 100%; padding: 18px; background: var(--primary); color: white; border: none; border-radius: 14px; font-size: 18px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2); }

                /* Bottom Navigation Bar */
                .nav-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: white; display: flex; justify-content: space-around; padding: 12px 0 25px 0; border-top: 1px solid #edf2f7; box-shadow: 0 -5px 20px rgba(0,0,0,0.03); z-index: 1000; }
                .nav-item { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #94a3b8; font-size: 11px; font-weight: 500; transition: 0.3s; flex: 1; }
                .nav-item.active { color: var(--primary); }
                .nav-icon { font-size: 22px; margin-bottom: 4px; }

                /* Lists */
                .status-row { border-bottom: 1px solid #f1f5f9; padding: 15px 0; display: flex; justify-content: space-between; align-items: center; }
            </style>
        </head>
        <body>
            <div class="top-banner">
                <img src="/uploads/logo.png?v=${Date.now()}" onerror="this.src='https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png'" class="profile-pic">
            </div>

            <div id="home" class="page active">
                <h2 style="margin: 10px 0 20px 0;">Welcome Back</h2>
                <div class="card">
                    <div id="dailyTotal" class="total-box">Today: KES 0</div>
                    <form action="/push" method="POST">
                        <input type="password" name="password" placeholder="Manager PIN" required>
                        <input type="number" name="phone" placeholder="Recipient Phone (254...)" required>
                        <input type="number" name="amount" placeholder="Amount (KES)" required>
                        <button type="submit" class="btn-send">SEND STK PUSH</button>
                    </form>
                </div>
            </div>

            <div id="activity" class="page">
                <h2 style="margin: 10px 0 20px 0;">Live Activity</h2>
                <div class="card" id="history-list">
                    No recent transactions...
                </div>
            </div>

            <div id="transfer" class="page">
                <h2>Transfer</h2>
                <div class="card">Feature coming soon...</div>
            </div>

            <div id="vault" class="page">
                <h2>Vault</h2>
                <div class="card">Secure your savings here.</div>
            </div>

            <div id="more" class="page">
                <h2>Settings</h2>
                <div class="card">
                    <p style="color: #64748b; font-size: 14px;">Update App Branding</p>
                    <form action="/upload-logo" method="POST" enctype="multipart/form-data">
                        <input type="file" name="logo" accept="image/*" onchange="this.form.submit()">
                    </form>
                    <hr style="border:0; border-top:1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #94a3b8;">System Version: 2.0.4 (Navigation Build)</p>
                </div>
            </div>

            <nav class="nav-bar">
                <a href="javascript:void(0)" class="nav-item active" onclick="showPage('home', this)">
                    <span class="nav-icon">🏠</span><span>Home</span>
                </a>
                <a href="javascript:void(0)" class="nav-item" onclick="showPage('activity', this)">
                    <span class="nav-icon">📊</span><span>Activity</span>
                </a>
                <a href="javascript:void(0)" class="nav-item" onclick="showPage('transfer', this)">
                    <span class="nav-icon">💸</span><span>Transfer</span>
                </a>
                <a href="javascript:void(0)" class="nav-item" onclick="showPage('vault', this)">
                    <span class="nav-icon">🔐</span><span>Vault</span>
                </a>
                <a href="javascript:void(0)" class="nav-item" onclick="showPage('more', this)">
                    <span class="nav-icon">⚙️</span><span>More</span>
                </a>
            </nav>

            <script>
                function showPage(id, el) {
                    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    document.getElementById(id).classList.add('active');
                    el.classList.add('active');
                }

                async function updateStatus() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();
                        document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
                        document.getElementById('history-list').innerHTML = data.transactions.map(t => {
                            let statusColor = t.status.includes('Successful') ? '#28a745' : (t.status.includes('Processing') ? '#17a2b8' : '#dc3545');
                            return \`
                                <div class="status-row">
                                    <div style="text-align:left;">
                                        <b style="font-size:15px;">\${t.phone}</b><br>
                                        <small style="color:#94a3b8;">\${t.time} • \${t.status}</small>
                                    </div>
                                    <b style="color:\${statusColor}; font-size:16px;">KES \${t.amount}</b>
                                </div>\`;
                        }).join('') || 'No activity';
                    } catch(e) {}
                }
                setInterval(updateStatus, 3000);
                updateStatus();
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
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': PAYNECTA_KEY, 'Content-Type': 'application/json' } });

        const trackingId = response.data.merchant_request_id || response.data.transaction_id || response.data.request_id || Date.now();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send("API Error: " + err.message); }
});

app.post('/callback', (req, res) => {
    const bodyText = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyText.includes(String(t.id)) || bodyText.includes(String(t.phone)));
    if (tx) { 
        const data = bodyText.toLowerCase();
        if (data.includes('"success"') || data.includes('"completed"') || data.includes('"0"')) tx.status = 'Successful ✅';
        else if (data.includes('cancel') || data.includes('1032')) tx.status = 'Cancelled ❌';
        else tx.status = 'Failed ❌';
    }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
