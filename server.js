const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
let serverLogs = [];

const getKenyaTime = () => {
    return new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
};

const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    // PAYSTACK SUCCESS: Look for "event":"charge.success"
    if (data.includes('charge.success') || data.includes('"status":"success"')) return 'Successful ✅';
    // PAYNECTA SUCCESS
    if (data.includes('"res_code":"00"') || data.includes('"status":0')) return 'Successful ✅';
    
    if (data.includes('wrong pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    if (data.includes('insufficient') || data.includes('balance') || data.includes('"1"')) return 'Low Balance 💸';
    if (data.includes('cancel') || data.includes('1032') || data.includes('abandoned')) return 'Cancelled ❌';
    if (data.includes('timeout') || data.includes('1037')) return 'Timeout ⏳';
    return 'Pending/Other ⚠️';
};

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount), 0);
    res.json({ transactions, todayTotal, serverLogs });
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: sans-serif; background: #0a0a0a; color: #00f2ff; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 15px; }
                .container { background: #111; padding: 25px; border-radius: 20px; width: 100%; max-width: 400px; border: 1px solid #00f2ff; box-shadow: 0 0 15px #00f2ff33; text-align: center; margin-bottom: 15px; }
                input { width: 100%; padding: 15px; margin-bottom: 10px; border: 1px solid #333; background: #000; color: #fff; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
                .btn-paynecta { width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 10px; }
                .btn-paystack { width: 100%; padding: 15px; background: #011b33; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; border: 1px solid #00f2ff; }
                .history-card { width: 100%; max-width: 400px; background: #111; border-radius: 15px; padding: 20px; border: 1px solid #333; margin-bottom: 15px; }
                .tx-row { display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #222; font-size:13px; }
                .debug-box { width:100%; max-width:400px; background:#000; color:#ff004c; font-family:monospace; padding:10px; border-radius:10px; font-size:10px; border: 1px solid #ff004c; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 style="color: #ffd700;">CyberPay Command Center</h2>
                <div id="dailyTotal" style="font-size:20px; margin-bottom:15px;">TOTAL: KES 0</div>
                <form method="POST">
                    <input type="password" name="password" placeholder="System Key" required>
                    <input type="number" name="phone" placeholder="254..." required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" formaction="/push" class="btn-paynecta">PAYNECTA CORE</button>
                    <button type="submit" formaction="/paystack-push" class="btn-paystack">PAYSTACK CORE</button>
                </form>
            </div>
            <div class="history-card">
                <h3 style="margin-top:0;">Live Stream</h3>
                <div id="history-list">Scanning...</div>
            </div>
            <div class="debug-box">
                <b>INCIDENT LOGS:</b>
                <div id="log-list">No data...</div>
            </div>
            <script>
                async function updateStatus() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();
                        document.getElementById('dailyTotal').innerText = 'TOTAL: KES ' + data.todayTotal;
                        let html = '';
                        data.transactions.forEach(t => {
                            const isSuccess = t.status.includes('Successful');
                            html += '<div class="tx-row"><div><b>'+t.phone+'</b><br><small>'+t.provider+'</small></div><div style="text-align:right;"><b>KES '+t.amount+'</b><br><span style="color:'+(isSuccess ? '#00ff00' : '#ff004c')+'">'+t.status+'</span></div></div>';
                        });
                        document.getElementById('history-list').innerHTML = html || 'Idle';
                        let logHtml = '';
                        data.serverLogs.forEach(l => { logHtml += '<div>['+l.time+'] '+l.msg+'</div>'; });
                        document.getElementById('log-list').innerHTML = logHtml;
                    } catch(e) {}
                }
                setInterval(updateStatus, 3000);
                updateStatus();
            </script>
        </body>
        </html>
    `);
});

// WEBHOOK LISTENER (The Core Fix)
app.post('/callback', (req, res) => {
    const body = req.body;
    const bodyString = JSON.stringify(body).toLowerCase();
    
    // Log for the visual debugger
    serverLogs.unshift({ time: getKenyaTime(), msg: "Inbound: " + bodyString.substring(0, 50) });
    if (serverLogs.length > 5) serverLogs.pop();

    // 1. Get potential IDs from Paystack's nested structure
    const paystackRef = body.data?.reference || body.reference;
    // 2. Get potential IDs from Paynecta
    const paynectaID = body.merchant_request_id || body.transaction_id;

    let tx = transactions.find(t => 
        (paystackRef && String(t.id) === String(paystackRef)) || 
        (paynectaID && String(t.id) === String(paynectaID)) ||
        (bodyString.includes(String(t.phone).replace('+', '')))
    );

    if (tx) {
        tx.status = translateStatus(body);
    }
    
    res.status(200).send('Event Received');
});

// PAYNECTA PUSH
app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Access Denied");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        const trackingId = response.data.merchant_request_id || response.data.transaction_id || Date.now();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime(), provider: 'Paynecta' });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

// PAYSTACK PUSH
app.post('/paystack-push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Access Denied");
    let fPhone = phone.trim();
    if (fPhone.startsWith('0')) fPhone = '+254' + fPhone.substring(1);
    else if (fPhone.startsWith('254')) fPhone = '+' + fPhone;

    try {
        const response = await axios.post('https://api.paystack.co/charge', {
            email: "princealwyne7@gmail.com",
            amount: amount * 100,
            currency: "KES",
            mobile_money: { phone: fPhone, provider: "mpesa" }
        }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } });
        
        const reference = response.data.data.reference;
        transactions.unshift({ id: reference, phone: fPhone, amount, status: 'Processing... 🔄', time: getKenyaTime(), provider: 'Paystack' });
        res.redirect('/');
    } catch (err) { res.status(500).send("Core Error: " + (err.response?.data?.message || err.message)); }
});

app.listen(process.env.PORT || 3000);
