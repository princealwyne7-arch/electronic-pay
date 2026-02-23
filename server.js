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

// PAYNECTA CREDENTIALS (RESTORED)
const PAYNECTA_KEY = "hmp_AegEZDHxA8uOAel2wp3ttkpK4FeBPwVa6bNiJcfE";
const PAYMENT_CODE = "PNT_957342";

const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes('"success"') || data.includes('"completed"') || data.includes('"0"')) return 'Successful ✅';
    if (data.includes('cancel') || data.includes('1032')) return 'Cancelled ❌';
    if (data.includes('timeout') || data.includes('1037')) return 'Timeout ⏳';
    if (data.includes('wrong') || data.includes('pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    if (data.includes('insufficient') || data.includes('1')) return 'Low Balance 💸';
    return 'Pending/Other ⚠️';
};

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
                body { font-family: sans-serif; background: #f8fafc; margin: 0; padding-bottom: 40px; text-align: center; }
                .top-banner { width: 100%; background: linear-gradient(135deg, #28a745, #1e7e34); padding: 40px 0; margin-bottom: -50px; border-radius: 0 0 30px 30px; display: flex; justify-content: center; }
                .profile-pic { width: 100px; height: 100px; border-radius: 50%; border: 4px solid white; object-fit: cover; box-shadow: 0 4px 15px rgba(0,0,0,0.2); background: white; }
                .container { background: white; padding: 25px; border-radius: 25px; width: 90%; max-width: 400px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); margin: 0 auto 15px auto; position: relative; z-index: 2; }
                input:focus { border-color: #28a745; box-shadow: 0 0 0 3px rgba(40,167,69,0.1); outline: none; } input { width: 100%; padding: 15px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
                .btn-send { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
                .history-card { width: 90%; max-width: 400px; background: white; border-radius: 20px; padding: 20px; margin: 0 auto; box-shadow: 0 5px 15px rgba(0,0,0,0.05); box-sizing: border-box; }
                .total-box { background: linear-gradient(135deg, #28a745, #1e7e34); color: white !important; box-shadow: 0 4px 15px rgba(40,167,69,0.3); padding: 12px; border-radius: 12px; margin-bottom: 15px; color: #2e7d32; font-weight: bold; }
                .status-row { border-bottom: 1px solid #f1f5f9; padding: 10px 0; font-size: 13px; text-align: left; }
                .flex-row { display: flex; justify-content: space-between; align-items: center; }
                .admin-box { width: 90%; max-width: 400px; margin: 30px auto; padding: 15px; background: #f1f5f9; border-radius: 15px; border: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; }
            
    .top-banner { position: fixed; top: 0; width: 100%; height: 120px; z-index: 1000; margin-bottom: 0; }
    .page { display: none; padding-top: 140px; padding-bottom: 100px; min-height: 100vh; box-sizing: border-box; }
    .page.active { display: block; }
    .nav-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: white; display: flex; border-top: 1px solid #eee; padding: 12px 0; z-index: 1000; }
    .nav-item { flex: 1; text-align: center; color: #94a3b8; font-size: 11px; cursor: pointer; }
    .nav-item.active { color: #28a745; font-weight: bold; }
    .calc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px; }
    .calc-grid button { padding: 18px; border-radius: 12px; border: none; background: #334155; color: white; font-size: 18px; font-weight: bold; }
    .calc-grid button.op { background: #28a745; }
</style>
        </head>
        <body>
            <div class="top-banner">
                <img src="/uploads/logo.png?v=${Date.now()}" onerror="this.src='https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png'" class="profile-pic">
            </div>
            <div id="home" class="page active"><div class="container">
                <h2 style="margin:5px 0;">Electronic Pay</h2>
                <div id="dailyTotal" class="total-box">Today: KES 0</div>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="Manager PIN" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" class="btn-send">SEND STK PUSH</button>
                </form>
            </div>
            </div></div><div id="activity" class="page"><div class="history-card">
                <h3 style="margin:0 0 10px 0; text-align:left;">Live Activity</h3>
                <div id="history-list">No activity...</div>
            </div>
            
            <script>
                async function updateStatus() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();
                        document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
                        document.getElementById('history-list').innerHTML = data.transactions.map(t => {
                            let statusColor = t.status.includes('Successful') ? '#28a745' : (t.status.includes('Processing') ? '#17a2b8' : '#dc3545');
                            return \`
                                <div class="status-row">
                                    <div class="flex-row">
                                        <b>\${t.phone}</b>
                                        <b style="color:\${statusColor};">KES \${t.amount}</b>
                                    </div>
                                    <div class="flex-row" style="margin-top:4px;">
                                        <small style="color:#94a3b8;">\${t.time}</small>
                                        <span style="color:\${statusColor}; font-size:11px;">\${t.status}</span>
                                    </div>
                                </div>\`;
                        }).join('') || 'No activity';
                    } catch(e) {}
                }
                setInterval(updateStatus, 3000);
                updateStatus();
            </script>
        
    </div></div>
    <div id="calc" class="page"><div class="container" style="background:#1e293b; color:white;">
        <h2 style="color:#10b981">Digital Ledger</h2>
        <input type="text" id="cdis" readonly value="0" style="background:transparent; color:#10b981; border:none; text-align:right; font-size:32px; width:100%; font-family:monospace;">
        <div class="calc-grid">
            <button onclick="cCl()">C</button><button class="op" onclick="cIn('/')">÷</button><button class="op" onclick="cIn('*')">×</button><button class="op" onclick="cIn('-')">-</button>
            <button onclick="cIn('7')">7</button><button onclick="cIn('8')">8</button><button onclick="cIn('9')">9</button><button class="op" onclick="cIn('+')">+</button>
            <button onclick="cIn('4')">4</button><button onclick="cIn('5')">5</button><button onclick="cIn('6')">6</button><button class="op" style="grid-row:span 2" onclick="cRes()">=</button>
            <button onclick="cIn('1')">1</button><button onclick="cIn('2')">2</button><button onclick="cIn('3')">3</button>
            <button onclick="cIn('0')" style="grid-column:span 3">0</button>
        </div>
    </div></div>
    <div id="more" class="page"><div class="container">
        <div class="history-card" style="width:100%; margin-bottom:15px;">
            <p style="color:#28a745; font-weight:bold;">🔔 Notification Sounds (12+)</p>
            <select id="successSnd"><option>Classic Chime ✅</option><option>Cash Register 💰</option></select>
            <select id="errorSnd"><option>Alert Tone ⚠️</option></select>
        </div>
        <div class="admin-box" style="width:100%; margin:0;">
            <p>⚙️ <b>Branding Settings</b></p>
            <form action="/upload-logo" method="POST" enctype="multipart/form-data">
                <input type="file" name="logo" accept="image/*" onchange="this.form.submit()">
            </form>
        </div>
    </div></div>

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
        function cIn(v){ let d=document.getElementById('cdis'); if(d.value=='0') d.value=v; else d.value+=v; }
        function cCl(){ document.getElementById('cdis').value='0'; }
        function cRes(){ try{ let d=document.getElementById('cdis'); d.value=eval(d.value); }catch(e){ d.value='Error'; } }
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
            code: PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, {
            headers: { 'X-API-Key': PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });

        const trackingId = response.data.merchant_request_id || response.data.transaction_id || response.data.request_id || Date.now();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        if (transactions.length > 20) transactions.pop();
        res.redirect('/');
    } catch (err) { 
        res.status(500).send("API Error: " + err.message); 
    }
});

app.post('/callback', (req, res) => {
    const bodyText = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyText.includes(String(t.id)) || bodyText.includes(String(t.phone)));
    if (tx) { tx.status = translateStatus(req.body); }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
