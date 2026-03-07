const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 

const getKenyaTime = () => {
    return new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
};

const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes('success') || data.includes('approved') || data.includes('"0"')) return 'Successful ✅';
    if (data.includes('insufficient') || data.includes('balance')) return 'Low Balance 💸';
    if (data.includes('wrong') || data.includes('pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    if (data.includes('cancel') || data.includes('1032') || data.includes('abandoned')) return 'Cancelled ❌';
    return 'Failed/Other ❌';
};

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal });
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Courier New', monospace; background: #050505; color: #00f2ff; display: flex; flex-direction: column; align-items: center; padding: 15px; }
                .card { background: #111; border: 1px solid #00f2ff; padding: 25px; border-radius: 20px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 0 15px #00f2ff33; }
                input { width: 100%; padding: 14px; margin: 8px 0; background: #000; border: 1px solid #333; color: #fff; border-radius: 8px; box-sizing: border-box; }
                .btn { width: 100%; padding: 16px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; }
                .btn-necta { background: #28a745; color: white; }
                .btn-stack { background: #ffd700; color: black; }
                .tx-list { width: 100%; max-width: 400px; margin-top: 20px; background: #111; border: 1px solid #333; border-radius: 15px; padding: 10px; box-sizing: border-box; }
                .tx-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #222; font-size: 12px; }
            </style>
        </head>
        <body onclick="document.getElementById('beep').play().catch(() => {})">
            <div class="card">
                <h2 style="color:#ffd700;">AI COMMAND CENTER</h2>
                <div id="total" style="font-size:24px; margin-bottom:15px;">TOTAL: KES 0</div>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="PIN" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" name="provider" value="paynecta" class="btn btn-necta">PAYNECTA PUSH</button>
                    <button type="submit" name="provider" value="paystack" class="btn btn-stack">PAYSTACK PUSH</button>
                </form>
            </div>
            <div class="tx-list" id="list">Waiting for signals...</div>
            <audio id="beep" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>
            <script>
                async function update() {
                    const res = await fetch('/api/status');
                    const data = await res.json();
                    document.getElementById('total').innerText = 'TOTAL: KES ' + data.todayTotal;
                    let html = '';
                    data.transactions.forEach((t, i) => {
                        const isSuccess = t.status.includes('Successful');
                        if (i === 0 && isSuccess && !localStorage.getItem('ding_' + t.id)) {
                            document.getElementById('beep').play().catch(() => {});
                            localStorage.setItem('ding_' + t.id, 'true');
                        }
                        html += '<div class="tx-row"><div>'+t.phone+'<br><small>'+t.provider+'</small></div><div style="text-align:right;">KES '+t.amount+'<br><span style="color:'+(isSuccess ? '#00ff00' : '#ff004c')+'">'+t.status+'</span></div></div>';
                    });
                    document.getElementById('list').innerHTML = html || 'No activity';
                }
                setInterval(update, 3000);
            </script>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password, provider } = req.body;
    if (password !== "5566") return res.send("Denied");
    let fPhone = phone.trim();
    if (fPhone.startsWith('0')) fPhone = '+254' + fPhone.substring(1);
    else if (fPhone.startsWith('254')) fPhone = '+' + fPhone;

    try {
        let id;
        if (provider === 'paynecta') {
            const resp = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
                code: process.env.PAYMENT_CODE, mobile_number: phone, amount, email: "princealwyne7@gmail.com",
                callback_url: "https://electronic-pay.onrender.com/callback"
            }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
            id = resp.data.merchant_request_id || resp.data.transaction_id || Date.now();
        } else {
            const resp = await axios.post('https://api.paystack.co/charge', {
                email: "princealwyne7@gmail.com", amount: amount * 100, currency: "KES",
                mobile_money: { phone: fPhone, provider: "mpesa" }
            }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
            id = resp.data.data.reference;
        }
        transactions.unshift({ id, phone: fPhone, amount, status: 'Processing... 🔄', provider, time: getKenyaTime() });
        res.redirect('/');
    } catch (e) { res.status(500).send(e.message); }
});

app.post('/callback', (req, res) => {
    const bodyStr = JSON.stringify(req.body);
    // The ONLY change: It checks the whole message for the ID or the Phone number
    let tx = transactions.find(t => bodyStr.includes(String(t.id)) || bodyStr.includes(String(t.phone).replace('+', '')));
    if (tx) tx.status = translateStatus(req.body);
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
