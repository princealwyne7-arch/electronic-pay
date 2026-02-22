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
    return 'Pending/Other ⚠️';
};

app.get('/api/status', (req, res) => {
    const todayTotal = transactions.filter(t => t.status.includes('Successful')).reduce((sum, t) => sum + parseInt(t.amount), 0);
    res.json({ transactions, todayTotal });
});

app.get('/api/report', (req, res) => {
    let csv = "Phone,Amount,Time,Status\n";
    transactions.forEach(t => { csv += `${t.phone},${t.amount},${t.time},${t.status}\n`; });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=Report.csv');
    res.send(csv);
});

app.post('/api/clear', (req, res) => {
    transactions = [];
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: "Inter", sans-serif; background: #f8f9fa; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
        .glass-card { background: white; width: 100%; max-width: 450px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); padding: 25px; margin-bottom: 20px; box-sizing: border-box; text-align: center; }
        .profile-pic { width: 100px; height: 100px; border-radius: 50%; border: 4px solid #28a745; margin-bottom: 10px; object-fit: cover; }
        .total-box { background: #e8f5e9; padding: 12px; border-radius: 12px; margin-bottom: 15px; color: #2e7d32; font-weight: bold; }
        input { width: 100%; padding: 15px; margin-bottom: 10px; border: 2.5px solid #f0f0f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
        .btn-send { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
        .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 15px 0; }
        .btn-pro { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; border: none; font-weight: 600; font-size: 13px; cursor: pointer; }
        .btn-download { background: #e7f3ff; color: #007bff; }
        .btn-purge { background: #fff0f0; color: #dc3545; }
        .search-wrapper { position: relative; margin-top: 15px; }
        .search-input { width: 100%; padding: 14px 14px 14px 40px; border: 1.5px solid #eee; border-radius: 14px; font-size: 14px; box-sizing: border-box; }
        .tx-row { display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #f0f0f0; font-size:13px; align-items:center; }
    </style></head>
    <body>
        <div class="glass-card">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
            <h2 style="margin:5px 0;">Electronic Pay</h2>
            <div id="dailyTotal" class="total-box">Today: KES 0</div>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Manager PIN" required>
                <input type="number" name="phone" placeholder="2547..." required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" class="btn-send">SEND STK PUSH</button>
            </form>
        </div>
        <div class="glass-card">
            <h4 style="margin:0;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Admin Control Center</h4>
            <div class="admin-grid">
                <button onclick="window.location.href='/api/report'" class="btn-pro btn-download">📊 Export CSV</button>
                <button onclick="clearH()" class="btn-pro btn-purge">🗑️ Purge Data</button>
            </div>
        </div>
        <div class="glass-card">
            <h3 style="margin:0;font-size:18px;text-align:left;">Live Activity</h3>
            <div class="search-wrapper">
                <span style="position:absolute;left:15px;top:14px">🔍</span>
                <input type="text" id="qs" class="search-input" placeholder="Search transactions..." onkeyup="updateStatus()">
            </div>
            <div id="history-list" style="margin-top:15px"></div>
        </div>
        <script>
            async function updateStatus() {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
                const q = document.getElementById('qs').value.toLowerCase();
                const list = document.getElementById('history-list');
                list.innerHTML = data.transactions.filter(t => t.phone.includes(q)).map(t => \`
                    <div class="tx-row">
                        <div style="text-align:left;"><b>\${t.phone}</b><div style="font-size:10px; color:#999;">\${t.time}</div></div>
                        <div style="text-align:right;"><b style="color:#28a745;">KES \${t.amount}</b><div style="font-size:11px; font-weight:bold; color:\${t.status.includes('Successful') ? '#28a745' : '#f0ad4e'}">\${t.status}</div></div>
                    </div>\`).join('') || 'No activity';
            }
            function clearH() { if(confirm("Purge all data?")) fetch('/api/clear', {method:'POST'}).then(()=>updateStatus()); }
            setInterval(updateStatus, 3000); updateStatus();
        </script>
    </body></html>`);
});
app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        transactions.unshift({ phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});
app.post('/callback', (req, res) => {
    let tx = transactions.find(t => String(req.body.mobile_number).includes(t.phone) && t.status.includes('Processing'));
    if (tx) { tx.status = translateStatus(req.body); }
    res.sendStatus(200);
});
app.listen(process.env.PORT || 3000);
