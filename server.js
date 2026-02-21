const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let transactions = []; 
const getKenyaTime = () => {
    const now = new Date();
    const kenyaTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Nairobi"}));
    return { display: kenyaTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), dateStr: kenyaTime.toDateString() };
};
const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes('"success"') || data.includes('"completed"') || data.includes('"0"')) return 'Successful ✅';
    return 'Failed/Other ⚠️';
};
app.get('/api/status', (req, res) => {
    const now = getKenyaTime();
    const totals = { today: transactions.filter(t => t.status.includes('Successful') && t.dateStr === now.dateStr).reduce((s, t) => s + parseInt(t.amount), 0) };
    res.json({ transactions: transactions.slice(0, 20), totals });
});
app.get('/', (req, res) => {
    res.send(\`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
    body { font-family: sans-serif; background: #f0f2f5; margin: 0; padding: 15px; display: flex; flex-direction: column; align-items: center; }
    .container { background: white; padding: 20px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; margin-bottom: 15px; }
    .profile-pic { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #28a745; margin-bottom: 10px; }
    .total-box { background: #e8f5e9; padding: 10px; border-radius: 12px; margin-bottom: 15px; color: #2e7d32; font-weight: bold; font-size: 18px; }
    input { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; }
    .btn-send { width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; }
    .history-card { width: 100%; max-width: 400px; background: white; border-radius: 15px; padding: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .tx-row { border-bottom: 1px solid #eee; padding: 12px 0; }
    .action-btns { display: flex; gap: 5px; margin-top: 8px; }
    .act-btn { flex: 1; padding: 6px; border: none; border-radius: 5px; font-size: 10px; font-weight: bold; cursor: pointer; color: white; }
    .btn-wa { background: #25D366; } .btn-pr { background: #6c757d; }
    </style></head><body onclick="document.getElementById('s').play().then(p=>document.getElementById('s').pause())">
    <div class="container">
        <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
        <h3>Electronic Pay</h3>
        <div id="dt" class="total-box">Today: KES 0</div>
        <form action="/push" method="POST">
            <input type="password" name="password" placeholder="Manager PIN" required>
            <input type="number" name="phone" placeholder="2547..." required>
            <input type="number" name="amount" placeholder="Amount" required>
            <button type="submit" class="btn-send">SEND STK PUSH</button>
        </form>
    </div>
    <div class="history-card">
        <h4 style="margin:0;">History</h4>
        <div id="hl"></div>
    </div>
    <audio id="s" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"></audio>
    <script>
    async function up() {
        const r = await fetch('/api/status'); const d = await r.json();
        document.getElementById('dt').innerText = 'Today: KES ' + d.totals.today;
        document.getElementById('hl').innerHTML = d.transactions.map(t => {
            const isS = t.status.includes('Successful');
            if (isS && !localStorage.getItem('d_'+t.id)) { document.getElementById('s').play(); localStorage.setItem('d_'+t.id, 'true'); }
            return \`<div class="tx-row">
                <div style="display:flex; justify-content:space-between;"><b>\${t.phone}</b> <b style="color:#28a745;">KES \${t.amount}</b></div>
                <div style="font-size:11px; color:#666;">\${t.time} - \${t.status}</div>
                \${isS ? \`<div class="action-btns">
                    <button class="act-btn btn-wa" onclick="wa('\${t.phone}','\${t.amount}')">WhatsApp</button>
                    <button class="act-btn btn-pr" onclick="pr('\${t.phone}','\${t.amount}','\${t.time}')">Print</button>
                </div>\` : ''}
            </div>\`;
        }).join('') || 'No activity';
    }
    function wa(p,a) { window.open("https://wa.me/?text="+encodeURIComponent("*ELECTRONIC PAY RECEIPT*\\n\\n*Status:* Paid ✅\\n*Amount:* KES "+a+"\\n*Phone:* "+p+"\\n\\nThank you!")); }
    function pr(p,a,t) {
        const w = window.open('', '', 'width=400');
        w.document.write(\`<html><body style="text-align:center;font-family:monospace;padding:20px;"><h2>ELECTRONIC PAY</h2><hr><p>DATE: \${t}</p><p>PHONE: \${p}</p><h1>KES \${a}</h1><p>SUCCESSFUL ✅</p><hr><script>window.print();<\\/script></body></html>\`);
    }
    setInterval(up, 3000); up();
    </script></body></html>\`);
});
app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', { code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount, email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback" }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        const trackingId = response.data.merchant_request_id || Date.now().toString();
        const kTime = getKenyaTime();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: kTime.display, dateStr: kTime.dateStr });
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
