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

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount), 0);
    res.json({ transactions, todayTotal });
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: sans-serif; background: #f8fafc; display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; min-height: 100vh; overflow-y: auto; scroll-behavior: smooth; margin: 0; padding: 15px; }
                .feature-card { flex: 1 1 350px; background: white; padding: 20px; border-radius: 20px; width: 100%; max-width: 100%; box-shadow: 0 5px 15px rgba(0,0,0,0.05); margin-bottom: 20px; box-sizing: border-box; } .container { flex: 1 1 350px; background: white; padding: 25px; border-radius: 25px; width: 100%; max-width: 400px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); text-align: center; margin-bottom: 15px; }
                .profile-pic { width: 100px; height: 100px; border-radius: 50%; border: 4px solid #28a745; margin-bottom: 10px; object-fit: cover; }
                input:focus { border-color: #28a745; box-shadow: 0 0 0 3px rgba(40,167,69,0.1); outline: none; } input { width: 100%; padding: 15px; margin-bottom: 10px; border: 1px solid #e2e8f0; transition: all 0.3s ease; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
                .btn-send { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
                .history-card { flex: 1 1 350px; width: 100%; max-width: 100%; background: white; border-radius: 20px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); box-sizing: border-box; }
                .tx-row { display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #f0f0f0; font-size:13px; align-items:center; }
                .total-box { background: linear-gradient(135deg, #28a745, #1e7e34); color: white !important; box-shadow: 0 4px 15px rgba(40,167,69,0.3); padding: 10px; border-radius: 12px; margin-bottom: 15px; color: #2e7d32; font-weight: 800; font-size: 24px; letter-spacing: 1px; }
                .receipt-btn { background: #f0f0f0; border: none; padding: 5px 8px; border-radius: 5px; font-size: 10px; cursor: pointer; margin-left: 5px; }
.pulse{width:8px;height:8px;background:#28a745;border-radius:50%;margin-right:10px;animation:p 2s infinite}@keyframes p{0%{box-shadow:0 0 0 0 rgba(40,167,69,0.7)}70%{box-shadow:0 0 0 10px rgba(40,167,69,0)}100%{box-shadow:0 0 0 0 rgba(40,167,69,0)}}.btn-send:active{transform:scale(0.98);filter:brightness(0.9)}
.nav-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: white; display: flex; justify-content: space-around; padding: 10px 0; border-top: 1px solid #eee; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 1000; } 
.nav-item { font-size: 10px; color: #64748b; border: none; background: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; } 
.nav-item.active { color: #28a745; font-weight: bold; } 
.page { display: none; visibility: hidden; width: 100%; max-width: 450px; padding-bottom: 80px; } 
.page.active { display: block !important; visibility: visible !important; }
            </style>
        </head>
        <body onclick="document.getElementById('successSound').play().then(p=>document.getElementById('successSound').pause())">
            <div id="p1" class="page active"><div class="container">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
                <h2 style="margin:5px 0;font-size:20px;"> <div style="display:flex;align-items:center;justify-content:center;"><div class="pulse"></div>Electronic Pay</div></div></h2></div>
                <div id="dailyTotal" class="total-box">Today: KES 0</div>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="Manager PIN" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="Amount" required><input type="text" name="note" placeholder="Payment Note (Optional)">
                    <button type="submit" class="btn-send">SEND STK PUSH</button>
                </form>
            </div>
<br>
            <div class="history-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><h3 style="margin:0;font-size:16px;display:flex;align-items:center;">Live Activity <span id="txCount" style="margin-left:8px;background:#e2e8f0;color:#475569;font-size:11px;padding:2px 8px;border-radius:20px;font-weight:bold;">0</span></h3><button onclick="clearData()" style="background:#fff0f0;color:#dc3545;border:none;padding:5px 10px;border-radius:8px;font-size:12px;font-weight:bold;cursor:pointer;">🗑️ PURGE</button></div><input type="text" id="searchTerm" placeholder="🔍 Search phone..." onkeyup="updateStatus()" style="padding:10px;margin-bottom:10px;border-radius:10px;border:1px solid #eee;font-size:14px;">
                <div id="history-list">Loading...</div>
            </div>

            <audio id="successSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

            <script>
function up() {
    fetch('/status').then(r => r.json()).then(d => {
        // Update Home
        document.getElementById('tot').innerText = d.todayTotal;
        const list = document.getElementById('history-list');
        if(list) list.innerHTML = d.history.map(t => '<div class="history-item"><b>'+t.phone+'</b><br>'+t.status+'<hr></div>').join('') || 'No activity';
        
        // Update Wallet & Stats
        if(document.getElementById('walletBal')) document.getElementById('walletBal').innerText = 'KES ' + d.todayTotal.toLocaleString();
        const goal = parseFloat(localStorage.getItem('myGoal')) || 10000;
        const pct = Math.min((d.todayTotal / goal) * 100, 100);
        if(document.getElementById('goalBar')) {
            document.getElementById('goalBar').style.width = pct + '%';
            document.getElementById('goalPercent').innerText = Math.round(pct) + '%';
        }
    });
}
setInterval(up, 3000);
up();

function showPage(id, el) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    el.classList.add("active");
    window.scrollTo(0,0);
}
</script>
    <div class="nav-bar">
        <button class="nav-item active" onclick="showPage('p1', this)">🏠<br>Home</button>
        <button class="nav-item" onclick="showPage('p2', this)">📈<br>Stats</button>
        <button class="nav-item" onclick="showPage('p3', this)">🛠️<br>Tools</button>
        <button class="nav-item" onclick="showPage('p4', this)">⚙️<br>More</button>
    </div>
    </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password, note } = req.body;
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
        const trackingId = response.data.merchant_request_id || response.data.transaction_id || response.data.request_id || Date.now();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', note: note || 'General Payment', time: getKenyaTime() });
        if (transactions.length > 20) transactions.pop();
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
