const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

let transactions = []; 

const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const todayTotal = transactions.filter(t => t.status.includes('Successful')).reduce((sum, t) => sum + parseInt(t.amount), 0);
    res.json({ transactions, todayTotal });
});

app.post('/upload-logo', upload.single('logo'), (req, res) => {
    if (req.file) {
        const target = path.join(__dirname, 'uploads/logo.png');
        if (fs.existsSync(target)) fs.unlinkSync(target);
        fs.renameSync(req.file.path, target);
    }
    res.redirect('/');
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: sans-serif; background: #f8fafc; margin: 0; padding-bottom: 40px; text-align: center; }
                .top-banner { width: 100%; background: linear-gradient(135deg, #28a745, #1e7e34); padding: 40px 0; margin-bottom: -50px; border-radius: 0 0 30px 30px; display: flex; justify-content: center; }
                .profile-pic { width: 100px; height: 100px; border-radius: 50%; border: 4px solid white; object-fit: cover; box-shadow: 0 4px 15px rgba(0,0,0,0.2); background: white; }
                .container { background: white; padding: 25px; border-radius: 25px; width: 90%; max-width: 400px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); margin: 0 auto 15px auto; position: relative; z-index: 2; }
                input { width: 100%; padding: 15px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
                .btn-send { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; }
                .history-card { width: 90%; max-width: 400px; background: white; border-radius: 20px; padding: 20px; margin: 0 auto; box-shadow: 0 5px 15px rgba(0,0,0,0.05); box-sizing: border-box; }
                .total-box { background: #e8f5e9; padding: 12px; border-radius: 12px; margin-bottom: 15px; color: #2e7d32; font-weight: bold; }
                .status-row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 12px 0; font-size: 14px; }
                .admin-box { width: 90%; max-width: 400px; margin: 30px auto; padding: 15px; background: #f1f5f9; border-radius: 15px; border: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; }
            </style>
        </head>
        <body>
            <div class="top-banner">
                <img src="/uploads/logo.png?v=${Date.now()}" onerror="this.src='https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png'" class="profile-pic">
            </div>
            <div class="container" style="margin-top:60px;">
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
                <h3 style="margin:0 0 10px 0; text-align:left;">Live Activity</h3>
                <div id="history-list">No activity yet...</div>
            </div>

            <div class="admin-box">
                <p>⚙️ <b>System Settings</b></p>
                <form action="/upload-logo" method="POST" enctype="multipart/form-data">
                    <label>Change Logo Photo:</label><br>
                    <input type="file" name="logo" accept="image/*" onchange="this.form.submit()" style="margin-top:10px;">
                </form>
            </div>

            <script>
                async function updateStatus() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();
                        document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
                        document.getElementById('history-list').innerHTML = data.transactions.map(t => 
                            \`<div class="status-row">
                                <div style="text-align:left;"><b>\${t.phone}</b><br><small style="color:#94a3b8;">\${t.time}</small></div>
                                <div style="color:#28a745; font-weight:bold;">KES \${t.amount}</div>
                            </div>\`
                        ).join('') || 'No activity';
                    } catch(e) {}
                }
                setInterval(updateStatus, 3000);
                updateStatus();
            </script>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");
    transactions.unshift({ id: Date.now(), phone, amount, status: 'Processing...', time: getKenyaTime() });
    res.redirect('/');
});

app.listen(process.env.PORT || 3000);
