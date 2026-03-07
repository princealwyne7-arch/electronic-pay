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

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful') || t.status.includes('Approved'))
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
                .card { background: #111; border: 1px solid #00f2ff; padding: 25px; border-radius: 20px; width: 100%; max-width: 400px; text-align: center; }
                input { width: 100%; padding: 14px; margin: 8px 0; background: #000; border: 1px solid #333; color: #fff; border-radius: 8px; box-sizing: border-box; }
                .btn { width: 100%; padding: 16px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; }
                .btn-necta { background: #28a745; color: white; }
                .btn-stack { background: #ffd700; color: black; }
                .tx-list { width: 100%; max-width: 400px; margin-top: 20px; background: #111; border: 1px solid #333; border-radius: 15px; padding: 10px; box-sizing: border-box; }
                .tx-row { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #222; font-size: 11px; align-items: center; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="color:#ffd700;">AI COMMAND CENTER</h2>
                <div id="total" style="font-size:24px; color:#00f2ff;">KES 0</div>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="PIN" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" name="provider" value="paynecta" class="btn btn-necta">PAYNECTA PUSH</button>
                    <button type="submit" name="provider" value="paystack" class="btn btn-stack">PAYSTACK PUSH</button>
                </form>
            </div>
            <div class="tx-list" id="list">Scanning signals...</div>
            <script>
                async function update() {
                    const res = await fetch('/api/status');
                    const data = await res.json();
                    document.getElementById('total').innerText = 'KES ' + data.todayTotal;
                    let html = '';
                    data.transactions.forEach(t => {
                        const isSuccess = t.status.toLowerCase().includes('success') || t.status.toLowerCase().includes('approved');
                        html += '<div class="tx-row"><div><b>'+t.phone+'</b><br><small>'+t.provider+'</small></div><div style="text-align:right;">KES '+t.amount+'<br><span style="color:'+(isSuccess ? '#00ff00' : '#ff004c')+'">'+t.status+'</span></div></div>';
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

    // Clean Phone for Paystack (must be exactly 254...)
    let cleanPhone = phone.trim().replace('+', '');
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);

    try {
        let id;
        if (provider === 'paynecta') {
            const resp = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
                code: process.env.PAYMENT_CODE, mobile_number: phone, amount: parseInt(amount), email: "princealwyne7@gmail.com",
                callback_url: "https://electronic-pay.onrender.com/callback"
            }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
            id = resp.data.merchant_request_id || resp.data.transaction_id || Date.now();
        } else {
            // FIXED PAYSTACK PAYLOAD TO PREVENT 400 ERROR
            const resp = await axios.post('https://api.paystack.co/charge', {
                email: "princealwyne7@gmail.com",
                amount: Math.round(parseFloat(amount) * 100), // Ensures no decimals
                currency: "KES",
                mobile_money: { 
                    phone: cleanPhone, 
                    provider: "mpesa" 
                }
            }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" } });
            id = resp.data.data.reference;
        }
        transactions.unshift({ id, phone: cleanPhone, amount, status: 'Processing... 🔄', provider: provider.toUpperCase(), time: getKenyaTime() });
        res.redirect('/');
    } catch (e) { 
        console.error(e.response ? e.response.data : e.message);
        res.status(500).send("Push Failed: " + (e.response ? JSON.stringify(e.response.data) : e.message)); 
    }
});

app.post('/callback', (req, res) => {
    const bodyStr = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyStr.includes(String(t.id)) || bodyStr.includes(String(t.phone)));
    if (tx) {
        if (tx.provider === 'PAYSTACK') {
            // MIRROR MODE: Show the raw message from Paystack
            tx.status = req.body.data?.gateway_response || req.body.data?.message || req.body.message || "Updated";
        } else {
            // PAYNECTA: Show original mapping
            tx.status = bodyStr.includes('success') ? 'Successful ✅' : 'Failed ❌';
        }
    }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
