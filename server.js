const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 

const getKenyaTime = () => {
    return new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
};

const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes('"success"') || data.includes('"completed"') || data.includes('"0"')) return 'Successful ✅';
    if (data.includes('cancel') || data.includes('1032')) return 'Cancelled ❌';
    if (data.includes('timeout') || data.includes('1037')) return 'Timeout ⏳';
    if (data.includes('wrong') || data.includes('pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    if (data.includes('insufficient') || data.includes('1')) return 'Low Balance 💸';
    return 'Pending/Other ⚠️';
};

app.get('/', (req, res) => {
    let historyHtml = transactions.map(t => `
        <div class="tx-row" data-status="${t.status}">
            <div style="text-align:left;">
                <div style="font-weight:bold; color:#333;">${t.phone}</div>
                <div style="font-size:11px; color:#999;">${t.time}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:bold; color:#28a745;">KES ${t.amount}</div>
                <div class="status-text" style="font-size:11px; font-weight:bold; color:${
                    t.status.includes('Successful') ? '#28a745' : 
                    t.status.includes('Processing') ? '#f0ad4e' : '#d9534f'
                };">${t.status}</div>
            </div>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: sans-serif; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 15px; }
                .container { background: white; padding: 25px; border-radius: 25px; width: 100%; max-width: 400px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); text-align: center; margin-bottom: 15px; }
                .profile-pic { width: 110px; height: 110px; border-radius: 50%; border: 4px solid #28a745; margin-bottom: 10px; }
                input { width: 100%; padding: 15px; margin-bottom: 10px; border: 2px solid #f0f0f0; border-radius: 12px; font-size: 16px; width:100%; box-sizing:border-box; }
                .btn-send { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; }
                .history-card { width: 100%; max-width: 400px; background: white; border-radius: 20px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); box-sizing:border-box; }
                .tx-row { display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #f0f0f0; font-size:14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
                <h2>Electronic Pay</h2>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="Manager PIN" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" class="btn-send">SEND STK PUSH</button>
                </form>
            </div>
            <div class="history-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="margin:0; font-size:16px;">Live Status</h3>
                    <button onclick="location.reload()" style="font-size:12px; background:none; border:none; color:#1a73e8; font-weight:bold; cursor:pointer;">REFRESH</button>
                </div>
                <div id="history-list">${historyHtml || 'No activity'}</div>
            </div>

            <audio id="successSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

            <script>
                // Check if the most recent transaction is successful
                const rows = document.querySelectorAll('.tx-row');
                if (rows.length > 0) {
                    const latestStatus = rows[0].getAttribute('data-status');
                    // Play sound only if it was just successful and we haven't played it yet
                    if (latestStatus.includes('Successful') && !sessionStorage.getItem('played_'${rows[0].querySelector('div').innerText})) {
                        document.getElementById('successSound').play().catch(e => console.log("Click page to enable sound"));
                        sessionStorage.setItem('played_'${rows[0].querySelector('div').innerText}, 'true');
                    }
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
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, {
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });
        const trackingId = response.data.merchant_request_id || response.data.transaction_id || response.data.request_id;
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        if (transactions.length > 10) transactions.pop();
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/callback', (req, res) => {
    const bodyText = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyText.includes(String(t.id)) || bodyText.includes(String(t.phone)));
    if (tx) { tx.status = translateStatus(req.body); }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
