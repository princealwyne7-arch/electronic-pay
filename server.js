const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let txs = [];

const getK = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const total = txs.filter(t => t.status.includes('Succ')).reduce((s, t) => s + parseInt(t.amount), 0);
    res.json({ transactions: txs, todayTotal: total });
});

app.post('/api/clear', (req, res) => {
    txs = [];
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
        body{font-family:sans-serif;background:#f8fafc;margin:0;padding:20px;display:flex;flex-direction:column;align-items:center}
        .card{background:white;width:100%;max-width:400px;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,0.05);padding:25px;margin-bottom:15px;box-sizing:border-box}
        .total{background:linear-gradient(135deg,#28a745,#1e7e34);color:white;padding:20px;border-radius:18px;text-align:center;font-size:20px;font-weight:bold}
        input{width:100%;padding:15px;margin-bottom:10px;border:1px solid #e2e8f0;border-radius:12px;font-size:16px;box-sizing:border-box}
        .btn{width:100%;padding:18px;background:#28a745;color:white;border:none;border-radius:12px;font-size:18px;font-weight:700;cursor:pointer}
        .tx-row{display:flex;justify-content:space-between;padding:12px;border-bottom:1px solid #f0f0f0;font-size:13px;align-items:center}
        .badge{background:#e2e8f0;color:#475569;font-size:11px;padding:2px 8px;border-radius:20px;margin-left:8px}
    </style></head><body>
    <div class="card"><img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:80px;border-radius:50%;display:block;margin:0 auto 10px;border:3px solid #28a745;">
    <h2 style="text-align:center;">Electronic Pay</h2><div id="tot" class="total">Today: KES 0</div>
    <form action="/push" method="POST"><input type="password" name="password" placeholder="PIN" required><input type="number" name="phone" placeholder="2547..." required><input type="number" name="amount" placeholder="Amount" required><button type="submit" class="btn">SEND STK PUSH</button></form></div>
    <div class="card"><h4>Control Center</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">
    <button onclick="window.location.href='/api/status'" style="background:#e7f3ff;color:#007bff;border:none;padding:10px;border-radius:10px;font-weight:bold;">📊 Report</button>
    <button onclick="clr()" style="background:#fff0f0;color:#dc3545;border:none;padding:10px;border-radius:10px;font-weight:bold;">🗑️ Purge</button></div>
    <input type="text" id="q" placeholder="🔍 Search phone..." onkeyup="up()"></div>
    <div class="card"><h3>Activity <span id="cnt" class="badge">0</span></h3><div id="list"></div></div>
    <script>
        async function up(){
            try{
                const r=await fetch('/api/status');const d=await r.json();const t=d.transactions||[];
                document.getElementById('cnt').innerText=t.length;
                document.getElementById('tot').innerText='Today: KES '+d.todayTotal;
                const q=document.getElementById('q').value.toLowerCase();
                const l=document.getElementById('list');
                l.innerHTML=t.filter(x=>x.phone.includes(q)).map(x=>\`<div class="tx-row"><div><b>\${x.phone}</b><div style="color:#999;font-size:10px;">\${x.time}</div></div><div style="text-align:right;"><b style="color:#28a745;">KES \${x.amount}</b><div style="font-weight:bold;color:\${x.status.includes('Succ')?'#28a745':'#f0ad4e'}">\${x.status}</div></div></div>\`).join('')||'No activity';
            }catch(e){}
        }
        function clr(){if(confirm("Purge?"))fetch('/api/clear',{method:'POST'}).then(()=>up())}
        setInterval(up,3000);up();
    </script></body></html>`);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("PIN Error");
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "p@mail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
        txs.unshift({ phone, amount, status: 'Processing... 🔄', time: getK() });
        res.redirect('/');
    } catch (e) { res.status(500).send(e.message); }
});

app.post('/callback', (req, res) => {
    let t = txs.find(x => String(req.body.mobile_number).includes(x.phone) && x.status.includes('Processing'));
    if (t) t.status = JSON.stringify(req.body).toLowerCase().includes('"0"') ? 'Successful ✅' : 'Failed ⚠️';
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
