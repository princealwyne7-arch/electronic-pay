const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "5566";
const JWT_SECRET = process.env.JWT_SECRET || "cyber-secure-key-77";

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let transactions = []; 
let serverLogs = [];

const protect = (req, res, next) => {
    const token = req.cookies.session_token;
    if (!token) return res.redirect('/login');
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        res.clearCookie('session_token');
        res.redirect('/login');
    }
};

const getKenyaTime = () => {
    return new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
};

const translateStatus = (body) => {
    const data = JSON.stringify(body).toLowerCase();
    if (data.includes('success') || data.includes('approved') || data.includes('charge.success')) return 'Successful ✅';
    if (data.includes('insufficient') || data.includes('balance')) return 'Low Balance 💸';
    if (data.includes('wrong') || data.includes('pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    if (data.includes('cancel') || data.includes('1032') || data.includes('abandoned')) return 'Cancelled ❌';
    if (data.includes('timeout') || data.includes('1037')) return 'Timeout ⏳';
    return 'Signal Active 📡'; 
};

app.get('/login', (req, res) => {
    res.send(`
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Courier New', monospace; background: #050505; color: #ffd700; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .gate { border: 1px solid #ffd700; padding: 40px; border-radius: 15px; background: #111; box-shadow: 0 0 20px #ffd70033; text-align: center; width: 90%; max-width: 380px; }
                input { width: 100%; padding: 15px; margin: 15px 0; background: #000; border: 1px solid #333; color: #fff; border-radius: 8px; font-size: 16px; text-align: center; }
                button { width: 100%; padding: 15px; background: #ffd700; color: #000; border: none; font-weight: bold; cursor: pointer; border-radius: 8px; letter-spacing: 2px; }
            </style>
        </head>
        <body>
            <div class="gate">
                <h2 style="margin:0;">GATEWAY ACCESS</h2>
                <p style="font-size: 10px; color: #666;">ENCRYPTED SESSION REQUIRED</p>
                <form action="/login" method="POST">
                    <input type="password" name="key" placeholder="ACCESS KEY" required autofocus>
                    <button type="submit">AUTHORIZE</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    if (req.body.key === ADMIN_PASSWORD) {
        const token = jwt.sign({ auth: true }, JWT_SECRET, { expiresIn: '12h' });
        res.cookie('session_token', token, { httpOnly: true, secure: true });
        res.redirect('/');
    } else {
        res.send("<body style='background:#000;color:red;text-align:center;padding-top:50px;'>INVALID KEY. ACCESS DENIED.</body>");
    }
});

app.get('/api/status', protect, (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal, serverLogs });
});

app.get('/', protect, (req, res) => {
    res.send(\`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Courier New', monospace; background: #050505; color: #00f2ff; display: flex; flex-direction: column; align-items: center; padding: 15px; margin: 0; }
                .card { background: #111; border: 1px solid #00f2ff; padding: 25px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 0 20px #00f2ff33; text-align: center; }
                input { width: 100%; padding: 15px; margin: 8px 0; background: #000; border: 1px solid #333; color: #fff; border-radius: 8px; box-sizing: border-box; font-size: 16px; }
                .btn { width: 100%; padding: 16px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 15px; text-transform: uppercase; }
                .btn-necta { background: #00ff88; color: #000; }
                .btn-stack { background: #ffd700; color: #000; }
                .tx-list { width: 100%; max-width: 400px; margin-top: 25px; border: 1px solid #333; border-radius: 15px; background: #111; padding: 15px; box-sizing: border-box; }
                .tx-row { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #222; font-size: 12px; align-items: center; }
                .log-console { width: 100%; max-width: 400px; margin-top: 15px; background: #000; color: #ff004c; font-size: 10px; padding: 12px; border: 1px solid #ff004c; border-radius: 8px; min-height: 50px; }
            </style>
        </head>
        <body onclick="document.getElementById('beep').play().catch(() => {})">
            <div class="card">
                <h2 style="color:#ffd700; margin-bottom:5px; letter-spacing: 2px;">AI COMMAND CENTER</h2>
                <div id="total" style="font-size:26px; font-weight:bold; margin-bottom:15px; color:#00f2ff;">KES 0</div>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="SYSTEM ACCESS KEY" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="AMOUNT (KES)" required>
                    <button type="submit" name="provider" value="paynecta" class="btn btn-necta">PAYNECTA PUSH</button>
                    <button type="submit" name="provider" value="paystack" class="btn btn-stack">PAYSTACK PUSH</button>
                </form>
            </div>
            <div class="tx-list" id="list">CONNECTING TO STREAM...</div>
            <div class="log-console" id="logs">LOGS: STANDBY</div>
            <audio id="beep" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>
            <script>
                async function sync() {
                    try {
                        const res = await fetch('/api/status');
                        if (res.status === 401) window.location.href = '/login';
                        const data = await res.json();
                        document.getElementById('total').innerText = 'KES ' + data.todayTotal.toLocaleString();
                        let html = '';
                        data.transactions.forEach((t, i) => {
                            const isSuccess = t.status.includes('Successful');
                            if (i === 0 && isSuccess && !localStorage.getItem('ding_' + t.id)) {
                                document.getElementById('beep').play().catch(() => {});
                                localStorage.setItem('ding_' + t.id, 'true');
                            }
                            html += '<div class="tx-row"><div><b>'+t.phone+'</b><br><small style="color:#666;">'+t.provider+' | '+t.time+'</small></div><div style="text-align:right;"><b style="color:#ffd700;">KES '+t.amount+'</b><br><span style="color:'+(isSuccess ? '#00ff00' : t.status.includes('Processing') ? '#ffd700' : '#ff004c')+'">'+t.status+'</span></div></div>';
                        });
                        document.getElementById('list').innerHTML = html || 'NO DATA SIGNALS';
                        let l = 'LIVE LOGS:';
                        data.serverLogs.forEach(m => { l += '<div>> '+m.msg+'</div>'; });
                        document.getElementById('logs').innerHTML = l;
                    } catch(e) {}
                }
                setInterval(sync, 3000);
                sync();
            </script>
        </body>
        </html>
    \`);
});

app.post('/push', protect, async (req, res) => {
    const { phone, amount, password, provider } = req.body;
    if (password !== ADMIN_PASSWORD) return res.send("ACCESS DENIED: INVALID KEY");

    let fPhone = phone.trim();
    if (fPhone.startsWith('0')) fPhone = '+254' + fPhone.substring(1);
    else if (fPhone.startsWith('254')) fPhone = '+' + fPhone;

    try {
        let trackingId;
        if (provider === 'paynecta') {
            const resp = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
                code: process.env.PAYMENT_CODE,
                mobile_number: phone,
                amount: amount,
                email: "princealwyne7@gmail.com",
                callback_url: "https://electronic-pay.onrender.com/callback"
            }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
            trackingId = resp.data.merchant_request_id || resp.data.transaction_id || Date.now();
        } else {
            const resp = await axios.post('https://api.paystack.co/charge', {
                email: "princealwyne7@gmail.com",
                amount: amount * 100,
                currency: "KES",
                mobile_money: { phone: fPhone, provider: "mpesa" }
            }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
            trackingId = resp.data.data.reference;
        }
        
        transactions.unshift({ id: trackingId, phone: fPhone, amount, status: 'Processing... 🔄', provider: provider.toUpperCase(), time: getKenyaTime() });
        if (transactions.length > 20) transactions.pop();
        res.redirect('/');
    } catch (e) { res.status(500).send("Push Failed: " + e.message); }
});

app.post('/callback', (req, res) => {
    const bodyStr = JSON.stringify(req.body);
    serverLogs.unshift({ msg: "Inbound Signal: " + bodyStr.substring(0, 35) + "..." });
    if (serverLogs.length > 3) serverLogs.pop();
    const ref = req.body.data?.reference || req.body.merchant_request_id || req.body.transaction_id || req.body.reference;
    const tx = transactions.find(t => (ref && String(t.id) === String(ref)) || bodyStr.includes(String(t.phone).replace('+', '')));
    if (tx) tx.status = translateStatus(req.body);
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
