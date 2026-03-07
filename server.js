const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
let serverLogs = [];

const getKenyaTime = () => {
    return new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
};

// IMPROVED TRANSLATOR: Maps your logs exactly to the UI
const translateStatus = (body) => {
    const data = JSON.stringify(body).toLowerCase();
    if (data.includes('success') || data.includes('approved') || data.includes('charge.success')) return 'Successful ✅';
    if (data.includes('insufficient') || data.includes('balance')) return 'Low Balance 💸';
    if (data.includes('wrong pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    if (data.includes('cancel') || data.includes('abandoned')) return 'Cancelled ❌';
    return 'Active 📡'; // Shows it is still live instead of "Failed"
};

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal, serverLogs });
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Courier New', monospace; background: #050505; color: #00f2ff; display: flex; flex-direction: column; align-items: center; padding: 15px; }
                .card { background: #111; border: 1px solid #00f2ff; padding: 20px; border-radius: 15px; width: 100%; max-width: 400px; box-shadow: 0 0 15px #00f2ff33; text-align: center; }
                input { width: 100%; padding: 12px; margin: 5px 0; background: #000; border: 1px solid #333; color: #fff; border-radius: 5px; box-sizing: border-box; }
                .btn { width: 100%; padding: 15px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 14px; }
                .btn-necta { background: #28a745; color: #fff; }
                .btn-stack { background: #ffd700; color: #000; }
                .tx-list { width: 100%; max-width: 400px; margin-top: 20px; border: 1px solid #333; border-radius: 10px; background: #111; padding: 10px; box-sizing: border-box; }
                .tx-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #222; font-size: 11px; }
                .log-console { width: 100%; max-width: 400px; margin-top: 15px; background: #000; color: #ff004c; font-size: 9px; padding: 10px; border: 1px solid #ff004c; border-radius: 5px; min-height: 40px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="color:#ffd700; margin:0;">AI COMMAND CENTER</h2>
                <div id="total" style="font-size:20px; margin:10px 0;">TOTAL: KES 0</div>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="SYSTEM KEY" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="AMOUNT" required>
                    <button type="submit" name="provider" value="paynecta" class="btn btn-necta">PAYNECTA PUSH</button>
                    <button type="submit" name="provider" value="paystack" class="btn btn-stack">PAYSTACK PUSH</button>
                </form>
            </div>
            <div class="tx-list" id="list">Synchronizing...</div>
            <div class="log-console" id="logs">SIGNAL STATUS: LISTENING</div>
            <script>
                async function update() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();
                        document.getElementById('total').innerText = 'TOTAL: KES ' + data.todayTotal;
                        let h = '';
                        data.transactions.forEach(t => {
                            const isSuccess = t.status.includes('Successful');
                            h += '<div class="tx-row"><span>'+t.phone+' ('+t.provider+')</span><span style="color:'+(isSuccess ? '#00ff00' : '#ff004c')+'">'+t.status+'</span></div>';
                        });
                        document.getElementById('list').innerHTML = h || 'No Active Signals';
                        let l = 'SIGNAL STATUS: ACTIVE';
                        data.serverLogs.forEach(m => { l += '<div>> '+m.msg+'</div>'; });
                        document.getElementById('logs').innerHTML = l;
                    } catch(e) {}
                }
                setInterval(update, 3000);
            </script>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password, provider } = req.body;
    if (password !== "5566") return res.send("PIN ERROR");

    let fPhone = phone.trim();
    if (fPhone.startsWith('0')) fPhone = '+254' + fPhone.substring(1);
    else if (fPhone.startsWith('254')) fPhone = '+' + fPhone;

    try {
        if (provider === 'paynecta') {
            const resp = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
                code: process.env.PAYMENT_CODE,
                mobile_number: phone,
                amount: amount,
                email: "princealwyne7@gmail.com",
                callback_url: "https://electronic-pay.onrender.com/callback"
            }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
            // Using the 'id' seen in your signal logs
            const id = resp.data.merchant_request_id || resp.data.transaction_id || Date.now();
            transactions.unshift({ id, phone, amount, status: 'Processing... 🔄', provider: 'Paynecta' });
        } else {
            const resp = await axios.post('https://api.paystack.co/charge', {
                email: "princealwyne7@gmail.com",
                amount: amount * 100,
                currency: "KES",
                mobile_money: { phone: fPhone, provider: "mpesa" }
            }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
            transactions.unshift({ id: resp.data.data.reference, phone: fPhone, amount, status: 'Processing... 🔄', provider: 'Paystack' });
        }
        res.redirect('/');
    } catch (e) { res.status(500).send("Push Failed: " + e.message); }
});

app.post('/callback', (req, res) => {
    const bodyStr = JSON.stringify(req.body);
    serverLogs.unshift({ msg: "Signal In: " + bodyStr.substring(0, 30) });
    if (serverLogs.length > 3) serverLogs.pop();

    // Universal ID Finder: Looks for reference, transaction_id, or the nested data.id from your logs
    const ref = req.body.data?.reference || req.body.merchant_request_id || req.body.transaction_id || req.body.id || (req.body.data && req.body.data.id);
    
    const tx = transactions.find(t => 
        (ref && String(t.id) === String(ref)) || 
        bodyStr.includes(String(t.phone).replace('+', ''))
    );
    
    if (tx) tx.status = translateStatus(req.body);
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
