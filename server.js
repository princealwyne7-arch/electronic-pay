const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_URI).then(() => console.log('DB OK')).catch(err => console.log('DB ERR', err));
const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    phone: String, amount: Number, status: String, time: String, dateStr: String, createdAt: { type: Date, default: Date.now }
}));
const getKenyaTime = () => {
    const now = new Date();
    const k = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Nairobi"}));
    return { display: k.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), dateStr: k.toDateString() };
};
app.get('/api/status', async (req, res) => {
    try {
        const now = getKenyaTime();
        const txs = await Transaction.find().sort({ createdAt: -1 }).limit(50);
        const todayTxs = await Transaction.find({ dateStr: now.dateStr, status: 'Successful ✅' });
        const total = todayTxs.reduce((s, t) => s + t.amount, 0);
        res.json({ transactions: txs, totals: { today: total } });
    } catch (e) { res.json({ transactions: [], totals: { today: 0 } }); }
});
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
    body { font-family: sans-serif; background: #f0f2f5; margin: 0; padding: 15px; display: flex; flex-direction: column; align-items: center; }
    .container { background: white; padding: 20px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; margin-bottom: 15px; }
    .total-box { background: #e8f5e9; padding: 10px; border-radius: 12px; margin-bottom: 15px; color: #2e7d32; font-weight: bold; font-size: 18px; }
    input { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; }
    .btn-send { width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 10px; font-weight: bold; }
    .history-card { width: 100%; max-width: 400px; background: white; border-radius: 15px; padding: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .tx-row { border-bottom: 1px solid #eee; padding: 10px 0; }
    .search-box { border: 2px solid #28a745; margin-bottom: 10px; }
    </style></head><body>
    <div class="container">
        <h3>Electronic Pay</h3>
        <div id="dt" class="total-box">Today: KES 0</div>
        <form action="/push" method="POST">
            <input type="password" name="password" placeholder="PIN" required>
            <input type="number" name="phone" placeholder="2547..." required>
            <input type="number" name="amount" placeholder="Amount" required>
            <button type="submit" class="btn-send">SEND STK PUSH</button>
        </form>
    </div>
    <div class="history-card">
        <h4>History (Cloud 🍃)</h4>
        <input type="text" id="qs" class="search-box" placeholder="Search phone..." onkeyup="up()">
        <div id="hl"></div>
    </div>
    <script>
    let allTxs = [];
    async function up() {
        const searchVal = document.getElementById('qs').value;
        if (!searchVal || allTxs.length === 0) {
            const r = await fetch('/api/status'); const d = await r.json();
            allTxs = d.transactions;
            document.getElementById('dt').innerText = 'Today: KES ' + d.totals.today;
        }
        const filtered = allTxs.filter(t => t.phone.includes(searchVal));
        document.getElementById('hl').innerHTML = filtered.map(t => \`
            <div class="tx-row">
                <div style="display:flex; justify-content:space-between;"><b>\${t.phone}</b> <b>KES \${t.amount}</b></div>
                <div style="font-size:11px; color:#666;">\${t.time} - \${t.status}</div>
            </div>\`).join('') || 'No matches';
    }
    setInterval(() => { if(!document.getElementById('qs').value) up() }, 5000); 
    up();
    </script></body></html>\`);
});
app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', { 
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount, 
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback" 
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        const kTime = getKenyaTime();
        await Transaction.create({ phone, amount, status: 'Processing... 🔄', time: kTime.display, dateStr: kTime.dateStr });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});
app.post('/callback', async (req, res) => {
    const data = JSON.stringify(req.body).toLowerCase();
    const status = (data.includes('"success"') || data.includes('"0"')) ? 'Successful ✅' : 'Failed ⚠️';
    await Transaction.findOneAndUpdate({ phone: new RegExp(req.body.mobile_number || ''), status: 'Processing... 🔄' }, { status: status });
    res.sendStatus(200);
});
app.listen(process.env.PORT || 3000);
