const multer = require('multer'); const path = require('path'); const fs = require('fs');
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
                body { font-family: sans-serif; background: #f8fafc; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 0 0 15px 0; }
                .container { background: white; padding: 25px; border-radius: 25px; width: 100%; max-width: 400px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); text-align: center; margin-bottom: 15px; }
                .top-banner { width: 100%; background: linear-gradient(135deg, #28a745, #1e7e34); padding: 40px 0; display: flex; justify-content: center; align-items: center; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; margin-bottom: -50px; }
                .profile-pic { width: 100px; height: 100px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); margin-bottom: 10px; object-fit: cover; }
                input:focus { border-color: #28a745; box-shadow: 0 0 0 3px rgba(40,167,69,0.1); outline: none; } input:focus { border-color: #28a745; box-shadow: 0 0 0 3px rgba(40,167,69,0.1); outline: none; } input { width: 100%; padding: 0 0 15px 0; margin-bottom: 10px; border: 1px solid #e2e8f0; transition: all 0.3s ease; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
                .btn-send { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
                .history-card { width: 100%; max-width: 400px; background: white; border-radius: 20px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); box-sizing: border-box; }
                .tx-row { display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #f0f0f0; font-size:13px; align-items:center; }
                .total-box { background: linear-gradient(135deg, #28a745, #1e7e34); color: white !important; box-shadow: 0 4px 15px rgba(40,167,69,0.3); padding: 10px; border-radius: 12px; margin-bottom: 15px; color: #2e7d32; font-weight: bold; }
                .receipt-btn { background: #f0f0f0; border: none; padding: 5px 8px; border-radius: 5px; font-size: 10px; cursor: pointer; margin-left: 5px; }
            </style>
        </head>
        <body onclick="document.getElementById('successSound').play().then(p=>document.getElementById('successSound').pause())">
            <div class="container">
                <div class="top-banner">
<style>
  .top-banner { width:100%; background:linear-gradient(135deg,#28a745,#1e7e34); padding:30px 0; display:flex; justify-content:center; margin-bottom:10px; border-radius:0 0 25px 25px; }
  .branding-panel { background:white; padding:15px; border-radius:15px; margin-top:20px; border:1px dashed #28a745; font-size:12px; }
</style>
<div class='top-banner'><img src='/uploads/logo.png' onerror="this.src='https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png'" class='profile-pic' style='border:3px solid white;'></div>
</div>
                <h2 style="margin:5px 0;">Electronic Pay</h2>
                <div id="dailyTotal" class="total-box">Today: KES 0</div>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="Manager PIN" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" class="btn-send">SEND STK PUSH</button>
                </form>
            </div>
            <div class="history-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><h3 style="margin:0;font-size:16px;">Live Activity</h3><button onclick="clearData()" style="background:#fff0f0;color:#dc3545;border:none;padding:5px 10px;border-radius:8px;font-size:12px;font-weight:bold;cursor:pointer;">🗑️ PURGE</button></div><input type="text" id="searchTerm" placeholder="🔍 Search phone..." onkeyup="updateStatus()" style="padding:10px;margin-bottom:10px;border-radius:10px;border:1px solid #eee;font-size:14px;">
                <div id="history-list">Loading...</div>
            </div>

            <audio id="successSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

            <script>
                async function updateStatus() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();
                        document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
                        const list = document.getElementById('history-list');
                        let html = '';
                        const query=document.getElementById("searchTerm").value; data.transactions.filter(t=>t.phone.includes(query)).forEach((t, index) => {
                            const isSuccess = t.status.includes('Successful');
                            if (index === 0 && isSuccess && !localStorage.getItem('ding_' + t.id)) {
                                document.getElementById('successSound').play().catch(() => {});
                                localStorage.setItem('ding_' + t.id, 'true');
                            }
                            html += '<div class="tx-row"><div style="text-align:left;"><b>'+t.phone+'</b><div style="font-size:10px; color:#999;">'+t.time+'</div></div><div style="text-align:right;"><b style="color:#28a745;">KES '+t.amount+'</b><div style="font-size:11px; font-weight:bold; color:'+(isSuccess ? '#28a745' : t.status.includes('Processing') ? '#f0ad4e' : '#d9534f')+'">'+t.status+(isSuccess ? ' <button class="receipt-btn" onclick="shareReceipt(\\''+t.phone+'\\',\\''+t.amount+'\\',\\''+t.time+'\\')">RECEIPT</button>' : '')+'</div></div></div>';
                        });
                        list.innerHTML = html || 'No activity';
                    } catch(e) {}
                }

function clearData(){if(confirm("Clear all records?"))fetch("/api/clear",{method:"POST"}).then(()=>updateStatus());}
                function shareReceipt(phone, amt, time) {
                    const text = "🧾 *ELECTRONIC PAY RECEIPT*\\n\\nPhone: " + phone + "\\nAmount: KES " + amt + "\\nTime: " + time + "\\nStatus: Paid ✅\\n\\n_Thank you!_";
                    window.open("https://wa.me/?text=" + encodeURIComponent(text));
                }

                setInterval(updateStatus, 3000);
                updateStatus();
            </script>
<div class='container' style='margin-top:20px; font-size:12px; border:1px dashed #ccc;'><h4>🎨 Branding Settings</h4><form action='/upload-logo' method='POST' enctype='multipart/form-data'>Logo: <input type='file' name='logo' accept='image/*' onchange='this.form.submit()'></form><form action='/upload-banner' method='POST' enctype='multipart/form-data'>Banner: <input type='file' name='banner' accept='image/*' onchange='this.form.submit()'></form></div>
        </body>
        </html>
    `);
});

app.post('/upload-logo', upload.single('logo'), (req, res) => res.redirect('/')); app.post('/upload-banner', upload.single('banner'), (req, res) => res.redirect('/'));
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
        const trackingId = response.data.merchant_request_id || response.data.transaction_id || response.data.request_id || Date.now();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
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


app.use('/uploads', express.static('uploads'));
app.post('/upload-logo', upload.single('logo'), (req, res) => {
    if (req.file) fs.renameSync(req.file.path, 'uploads/logo.png');
    res.redirect('/');
});
app.listen(process.env.PORT || 3000);
