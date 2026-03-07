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
                body { font-family: 'Courier New', monospace; background: #050505; color: #00f2ff; display: flex; flex-direction: column; align-items: center; padding: 15px; margin: 0; }
                .card { background: #111; border: 1px solid #00f2ff; padding: 25px; border-radius: 20px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 0 20px #00f2ff55; }
                input { width: 100%; padding: 15px; margin: 8px 0; background: #000; border: 1px solid #333; color: #fff; border-radius: 8px; box-sizing: border-box; font-size: 16px; outline: none; }
                .btn { width: 100%; padding: 16px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 14px; text-transform: uppercase; }
                .btn-necta { background: #28a745; color: white; }
                .btn-stack { background: #ffd700; color: black; }
                .tx-list { width: 100%; max-width: 420px; margin-top: 25px; border: 1px solid #333; border-radius: 15px; background: #111; padding: 10px; box-sizing: border-box; }
                .tx-row { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #222; font-size: 11px; align-items: center; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="color:#ffd700; margin:0; letter-spacing: 2px;">AI COMMAND CENTER</h2>
                <div id="total" style="font-size:26px; font-weight:bold; margin:10px 0; color:#00f2ff;">KES 0</div>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="SYSTEM ACCESS KEY" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="AMOUNT" required>
                    <button type="submit" name="provider" value="paynecta" class="btn btn-necta">PAYNECTA PUSH</button>
                    <button type="submit" name="provider" value="paystack" class="btn btn-stack">PAYSTACK PUSH</button>
                </form>
            </div>
            <div class="tx-list" id="list">SCANNING STREAM...</div>
            <script>
                async function sync() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();
                        document.getElementById('total').innerText = 'KES ' + data.todayTotal.toLocaleString();
                        let html = '';
                        data.transactions.forEach(t => {
                            const isSuccess = t.status.toLowerCase().includes('success') || t.status.toLowerCase().includes('approved');
                            html += '<div class="tx-row"><div><b>'+t.phone+'</b><br><small>'+t.provider+'</small></div><div style="text-align:right;"><b style="color:#ffd700;">KES '+t.amount+'</b><br><span style="color:'+(isSuccess ? '#00ff00' : '#ff004c')+'">'+t.status+'</span></div></div>';
                        });
                        document.getElementById('list').innerHTML = html || 'NO DATA SIGNALS';
                    } catch(e) {}
                }
                setInterval(sync, 3000);
                sync();
            </script>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password, provider } = req.body;
    if (password !== "5566") return res.send("ACCESS DENIED");

    // FORMATTING LOGIC
    let rawPhone = phone.trim().replace('+', '');
    if (rawPhone.startsWith('0')) rawPhone = '254' + rawPhone.substring(1);
    
    // Paystack usually needs the + for mobile money
    const paystackPhone = '+' + rawPhone; 

    try {
        let id;
        if (provider === 'paynecta') {
            const resp = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
                code: process.env.PAYMENT_CODE, mobile_number: rawPhone, amount: parseInt(amount), email: "princealwyne7@gmail.com",
                callback_url: "https://electronic-pay.onrender.com/callback"
            }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
            id = resp.data.merchant_request_id || resp.data.transaction_id || Date.now();
        } else {
            // THE FIX: Explicitly sending +254 format to Paystack
            const resp = await axios.post('https://api.paystack.co/charge', {
                email: "princealwyne7@gmail.com",
                amount: Math.round(parseFloat(amount) * 100),
                currency: "KES",
                mobile_money: { 
                    phone: paystackPhone, 
                    provider: "mpesa" 
                }
            }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
            id = resp.data.data.reference;
        }
        transactions.unshift({ id, phone: paystackPhone, amount, status: 'Processing... 🔄', provider: provider.toUpperCase(), time: getKenyaTime() });
        res.redirect('/');
    } catch (e) { 
        // Full error detail so we can see if formatting still bothers them
        res.status(500).send("Push Failed: " + (e.response ? JSON.stringify(e.response.data) : e.message)); 
    }
});

app.post('/callback', (req, res) => {
    const bodyStr = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyStr.includes(String(t.id)) || bodyStr.includes(String(t.phone).replace('+', '')));
    if (tx) {
        if (tx.provider === 'PAYSTACK') {
            tx.status = req.body.data?.gateway_response || req.body.data?.message || req.body.message || "Updated";
        } else {
            tx.status = bodyStr.includes('success') ? 'Successful ✅' : 'Failed ❌';
        }
    }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
