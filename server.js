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

// PRECISE STATUS MAPPING BASED ON YOUR RECENT LOGS
const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    
    if (data.includes('charge.success') || data.includes('"status":"success"')) return 'Successful ✅';
    if (data.includes('"res_code":"00"') || data.includes('"status":0')) return 'Successful ✅';
    
    // Matches your "insufficient balance" screenshot exactly
    if (data.includes('insufficient') || data.includes('balance')) return 'Low Balance 💸';
    
    if (data.includes('wrong pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    if (data.includes('cancel') || data.includes('1032') || data.includes('abandoned')) return 'Cancelled ❌';
    if (data.includes('timeout') || data.includes('1037')) return 'Timeout ⏳';
    
    return 'Failed/Other ❌';
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
                body { font-family: 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; display: flex; flex-direction: column; align-items: center; padding: 15px; }
                .card { background: #161b22; border: 1px solid #30363d; padding: 25px; border-radius: 15px; width: 100%; max-width: 400px; text-align: center; margin-bottom: 20px; }
                input { width: 100%; padding: 12px; margin: 8px 0; background: #0d1117; border: 1px solid #30363d; color: white; border-radius: 6px; box-sizing: border-box; }
                .btn { width: 100%; padding: 14px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px; }
                .btn-paynecta { background: #238636; color: white; }
                .btn-paystack { background: #1f6feb; color: white; }
                .status-box { width: 100%; max-width: 400px; background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 15px; }
                .tx-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #21262d; font-size: 13px; }
                .debug-console { width: 100%; max-width: 400px; background: #000; color: #58a6ff; font-family: monospace; font-size: 10px; padding: 10px; border-radius: 8px; margin-top: 20px; border: 1px solid #238636; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="color:#58a6ff; margin:0 0 10px 0;">ELECTRONIC PAY</h2>
                <div id="total" style="font-size:24px; font-weight:bold; color:#f0883e;">KES 0.00</div>
                <form method="POST">
                    <input type="password" name="password" placeholder="ADMIN PIN" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" formaction="/push" class="btn btn-paynecta">PAYNECTA CORE</button>
                    <button type="submit" formaction="/paystack-push" class="btn btn-paystack">PAYSTACK CORE</button>
                </form>
            </div>
            <div class="status-box">
                <h3 style="margin-top:0;">Live Activities</h3>
                <div id="activity-list">Listening for signals...</div>
            </div>
            <div class="debug-console" id="debug-logs">WEBHOOK CONSOLE: Offline</div>
            <script>
                async function refresh() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();
                        document.getElementById('total').innerText = 'KES ' + data.todayTotal.toLocaleString();
                        let html = '';
                        data.transactions.forEach(t => {
                            const isSuccess = t.status.includes('Successful');
                            html += '<div class="tx-item"><div><b>'+t.phone+'</b><br><small>'+t.provider+'</small></div><div style="text-align:right;"><b>KES '+t.amount+'</b><br><span style="color:'+(isSuccess ? '#3fb950' : '#f85149')+'">'+t.status+'</span></div></div>';
                        });
                        document.getElementById('activity-list').innerHTML = html || 'No recent activity';
                        let logHtml = 'WEBHOOK CONSOLE: Online<br>';
                        data.serverLogs.forEach(l => { logHtml += '> ['+l.time+'] ' + l.msg + '<br>'; });
                        document.getElementById('debug-logs').innerHTML = logHtml;
                    } catch(e) {}
                }
                setInterval(refresh, 3000);
                refresh();
            </script>
        </body>
        </html>
    `);
});

// IMPROVED CALLBACK TO CATCH NESTED DATA FROM YOUR LOGS
app.post('/callback', (req, res) => {
    const body = req.body;
    const bodyStr = JSON.stringify(body);
    
    serverLogs.unshift({ time: getKenyaTime(), msg: "Inbound Payload Detected" });
    if (serverLogs.length > 5) serverLogs.pop();

    // Catching the "Reference" from your screenshot
    const paystackRef = body.data?.reference || body.reference;
    const paynectaID = body.merchant_request_id || body.transaction_id;

    let tx = transactions.find(t => 
        (paystackRef && String(t.id) === String(paystackRef)) || 
        (paynectaID && String(t.id) === String(paynectaID)) ||
        (bodyStr.includes(String(t.phone).replace('+', '')))
    );

    if (tx) {
        tx.status = translateStatus(body);
    }
    
    res.sendStatus(200);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Denied");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
        const id = response.data.merchant_request_id || Date.now();
        transactions.unshift({ id, phone, amount, status: 'Processing... 🔄', time: getKenyaTime(), provider: 'Paynecta' });
        res.redirect('/');
    } catch (e) { res.status(500).send(e.message); }
});

app.post('/paystack-push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Denied");
    let fPhone = phone.trim();
    if (fPhone.startsWith('0')) fPhone = '+254' + fPhone.substring(1);
    else if (fPhone.startsWith('254')) fPhone = '+' + fPhone;

    try {
        const response = await axios.post('https://api.paystack.co/charge', {
            email: "princealwyne7@gmail.com",
            amount: amount * 100,
            currency: "KES",
            mobile_money: { phone: fPhone, provider: "mpesa" }
        }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
        const id = response.data.data.reference;
        transactions.unshift({ id, phone: fPhone, amount, status: 'Processing... 🔄', time: getKenyaTime(), provider: 'Paystack' });
        res.redirect('/');
    } catch (e) { res.status(500).send(e.message); }
});

app.listen(process.env.PORT || 3000);
