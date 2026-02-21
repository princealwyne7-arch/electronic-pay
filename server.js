const express = require('express');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DB_FILE = './database.json';

// Load or Create Database
let transactions = [];
if (fs.existsSync(DB_FILE)) {
    transactions = JSON.parse(fs.readFileSync(DB_FILE));
}

const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(transactions, null, 2));

const getKenyaTime = () => {
    const now = new Date();
    return {
        display: now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' }),
        raw: new Date(now.toLocaleString("en-US", {timeZone: "Africa/Nairobi"}))
    };
};

const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes('"success"') || data.includes('"completed"') || data.includes('"0"')) return 'Successful ✅';
    if (data.includes('cancel') || data.includes('1032')) return 'Cancelled ❌';
    if (data.includes('wrong') || data.includes('pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    return 'Failed/Pending ⚠️';
};

app.get('/api/status', (req, res) => {
    const now = getKenyaTime().raw;
    const isToday = (d) => new Date(d).toDateString() === now.toDateString();
    const isYesterday = (d) => {
        const yest = new Date(now); yest.setDate(yest.getDate() - 1);
        return new Date(d).toDateString() === yest.toDateString();
    };

    const totals = {
        today: transactions.filter(t => t.status.includes('Successful') && isToday(t.date)).reduce((s, t) => s + parseInt(t.amount), 0),
        yesterday: transactions.filter(t => t.status.includes('Successful') && isYesterday(t.date)).reduce((s, t) => s + parseInt(t.amount), 0),
        month: transactions.filter(t => t.status.includes('Successful') && new Date(t.date).getMonth() === now.getMonth()).reduce((s, t) => s + parseInt(t.amount), 0)
    };

    res.json({ transactions: transactions.slice(0, 50), totals });
});

app.post('/api/delete', (req, res) => {
    transactions = transactions.filter(t => t.id !== req.body.id);
    saveDB();
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: sans-serif; background: #f0f2f5; margin: 0; padding: 15px; display: flex; flex-direction: column; align-items: center; }
                .container { background: white; padding: 20px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; margin-bottom: 15px; }
                .profile-pic { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #28a745; margin-bottom: 10px; }
                .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 15px; }
                .stat-card { background: #f8f9fa; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: bold; color: #2e7d32; }
                input { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; }
                .btn-send { width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 10px; font-weight: bold; }
                .history-card { width: 100%; max-width: 400px; background: white; border-radius: 15px; padding: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .tx-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; align-items: center; font-size: 13px; }
                .del-btn { color: #d9534f; border: none; background: none; font-size: 18px; cursor: pointer; }
            </style>
        </head>
        <body onclick="document.getElementById('successSound').play().then(p=>document.getElementById('successSound').pause())">
            <div class="container">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
                <h3 style="margin:5px;">Electronic Pay</h3>
                <div class="stats-grid">
                    <div class="stat-card">Today<br><span id="totToday">0</span></div>
                    <div class="stat-card">Yest.<br><span id="totYest">0</span></div>
                    <div class="stat-card">Month<br><span id="totMonth">0</span></div>
                </div>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="Manager PIN" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" class="btn-send">SEND STK PUSH</button>
                </form>
            </div>
            <div class="history-card">
                <h4 style="margin:0 0 10px 0;">Recent Transactions</h4>
                <div id="history-list">Loading...</div>
            </div>
            <audio id="successSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"></audio>
            <script>
                async function delTx(id) { if(confirm('Delete this record?')) { await fetch('/api/delete', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id}) }); updateStatus(); } }
                async function updateStatus() {
                    const res = await fetch('/api/status'); const data = await res.json();
                    document.getElementById('totToday').innerText = data.totals.today;
                    document.getElementById('totYest').innerText = data.totals.yesterday;
                    document.getElementById('totMonth').innerText = data.totals.month;
                    const list = document.getElementById('history-list');
                    list.innerHTML = data.transactions.map(t => {
                        const isSuccess = t.status.includes('Successful');
                        if (isSuccess && !localStorage.getItem('ding_'+t.id)) { document.getElementById('successSound').play(); localStorage.setItem('ding_'+t.id, 'true'); }
                        return \`<div class="tx-row">
                            <div style="text-align:left;"><b>\${t.phone}</b><br><small>\${t.time}</small></div>
                            <div style="text-align:right;">
                                <b>KES \${t.amount}</b><br>
                                <span style="color:\${isSuccess?'#28a745':t.status.includes('Processing')?'#f0ad4e':'#d9534f'}">\${t.status}</span>
                                <button class="del-btn" onclick="delTx('\${t.id}')">×</button>
                            </div>
                        </div>\`;
                    }).join('') || 'No records';
                }
                setInterval(updateStatus, 3000); updateStatus();
            </script>
        </body></html>
    \`);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        const trackingId = response.data.merchant_request_id || response.data.transaction_id || Date.now().toString();
        const kTime = getKenyaTime();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: kTime.display, date: kTime.raw });
        saveDB(); res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/callback', (req, res) => {
    const bodyText = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyText.includes(String(t.id)) || bodyText.includes(String(t.phone)));
    if (tx) { tx.status = translateStatus(req.body); saveDB(); }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
