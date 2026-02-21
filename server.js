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
    return { display: kenyaTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), dateStr: kenyaTime.toDateString(), raw: kenyaTime };
};
const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes('"success"') || data.includes('"completed"') || data.includes('"0"')) return 'Successful ✅';
    if (data.includes('cancel') || data.includes('1032')) return 'Cancelled ❌';
    if (data.includes('wrong') || data.includes('pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    return 'Failed/Pending ⚠️';
};
app.get('/api/status', (req, res) => {
    const now = getKenyaTime();
    const totals = { today: transactions.filter(t => t.status.includes('Successful') && t.dateStr === now.dateStr).reduce((s, t) => s + parseInt(t.amount), 0) };
    res.json({ transactions: transactions.slice(0, 30), totals });
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body { font-family: sans-serif; background: #f0f2f5; margin: 0; padding: 15px; display: flex; flex-direction: column; align-items: center; }.container { background: white; padding: 20px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; margin-bottom: 15px; }.profile-pic { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #28a745; margin-bottom: 10px; }.total-box { background: #e8f5e9; padding: 10px; border-radius: 12px; margin-bottom: 15px; color: #2e7d32; font-weight: bold; font-size: 18px; }input { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; }.btn-send { width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; }.history-card { width: 100%; max-width: 400px; background: white; border-radius: 15px; padding: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }.tx-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; align-items: center; font-size: 13px; }.dl-btn { background: #1a73e8; color: white; border: none; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; margin-top: 10px; width: 100%; }</style></head><body onclick="document.getElementById('successSound').play().then(p=>document.getElementById('successSound').pause())"><div class="container"><img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic"><h3>Electronic Pay</h3><div id="dailyTotal" class="total-box">Today: KES 0</div><form action="/push" method="POST"><input type="password" name="password" placeholder="Manager PIN" required><input type="number" name="phone" placeholder="2547..." required><input type="number" name="amount" placeholder="Amount" required><button type="submit" class="btn-send">SEND STK PUSH</button></form></div><div class="history-card"><div style="display:flex; justify-content:space-between; align-items:center;"><h4 style="margin:0;">Live Status</h4><button class="dl-btn" style="width:auto; margin:0;" onclick="downloadHistory()">Download CSV</button></div><div id="history-list" style="margin-top:10px;">Loading...</div></div><audio id="successSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"></audio><script>let currentTransactions = []; async function updateStatus() { const res = await fetch('/api/status'); const data = await res.json(); currentTransactions = data.transactions; document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.totals.today; const list = document.getElementById('history-list'); list.innerHTML = data.transactions.map(t => { const isSuccess = t.status.includes('Successful'); if (isSuccess && !localStorage.getItem('ding_'+t.id)) { document.getElementById('successSound').play(); localStorage.setItem('ding_'+t.id, 'true'); } return '<div class="tx-row"><div style="text-align:left;"><b>'+t.phone+'</b><br><small>'+t.time+'</small></div><div style="text-align:right;"><b>KES '+t.amount+'</b><br><span style="color:'+(isSuccess?'#28a745':t.status.includes('Processing')?'#f0ad4e':'#d9534f')+'">'+t.status+'</span></div></div>'; }).join('') || 'No activity'; } function downloadHistory() { let csv = "Phone,Amount,Status,Time\\n"; currentTransactions.forEach(t => { csv += t.phone + "," + t.amount + "," + t.status + "," + t.time + "\\n"; }); const blob = new Blob([csv], { type: 'text/csv' }); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.setAttribute('hidden', ''); a.setAttribute('href', url); a.setAttribute('download', 'sales_history.csv'); document.body.appendChild(a); a.click(); document.body.removeChild(a); } setInterval(updateStatus, 3000); updateStatus(); </script></body></html>`);
});
app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', { code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount, email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback" }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        const trackingId = response.data.merchant_request_id || response.data.transaction_id || Date.now().toString();
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
