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
.page { display: none; width: 100%; max-width: 450px; padding-bottom: 80px; } 
.page.active { display: block; }
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
                            html += '<div class="tx-row"><div style="text-align:left;"><b>'+t.phone+'</b><div style="font-size:11px;color:#666;font-style:italic;">'+(t.note || "")+'</div><div style="font-size:10px; color:#999;">'+t.time+'</div></div><div style="text-align:right;"><b style="color:#28a745;">KES '+t.amount+'</b><div style="font-size:11px; font-weight:bold; color:'+(isSuccess ? '#28a745' : t.status.includes('Processing') ? '#f0ad4e' : '#d9534f')+'">'+t.status+(isSuccess ? ' <button class="receipt-btn" onclick="shareReceipt(\\''+t.phone+'\\',\\''+t.amount+'\\',\\''+t.time+'\\')">RECEIPT</button>' : '')+'</div></div></div>';
                        });
                        list.innerHTML = html || 'No activity';
                    } catch(e) {}
                }

function clearData(){if(confirm("Clear all records?"))fetch("/api/clear",{method:"POST"}).then(()=>updateStatus());}
function calc(v){const d=document.getElementById("calcDisplay");if(v=="="){try{d.value=eval(d.value)}catch(e){d.value="Error"}}else if(v=="C"){d.value=""}else{d.value+=v}}
                function shareReceipt(phone, amt, time) {
                    const text = "🧾 *ELECTRONIC PAY RECEIPT*\\n\\nPhone: " + phone + "\\nAmount: KES " + amt + "\\nTime: " + time + "\\nStatus: Paid ✅\\n\\n_Thank you!_";
                    window.open("https://wa.me/?text=" + encodeURIComponent(text));
                }

                setInterval(updateStatus, 3000);
    let sec = parseInt(localStorage.getItem("sessionSec") || 0); setInterval(() => { sec++; localStorage.setItem("sessionSec", sec); let h=Math.floor(sec/3600).toString().padStart(2,"0"); let m=Math.floor((sec%3600)/60).toString().padStart(2,"0"); let s=(sec%60).toString().padStart(2,"0"); if(document.getElementById("sessionClock")) document.getElementById("sessionClock").innerText = h+":"+m+":"+s; }, 1000); setInterval(()=>{ 
        sec++; 
        let h=Math.floor(sec/3600).toString().padStart(2,"0"); 
        let m=Math.floor((sec%3600)/60).toString().padStart(2,"0"); 
        let s=(sec%60).toString().padStart(2,"0"); 
        document.getElementById("sessionClock").innerText = h+":"+m+":"+s; 
    },1000);
                updateStatus();
        function addContact() {
            const p = prompt('Enter Phone (254...):');
            const n = prompt('Enter Name:');
            if(p && n) {
                let contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
                contacts.push({p, n});
                localStorage.setItem('contacts', JSON.stringify(contacts));
                loadContacts();
            }
        }
        function loadContacts() {
            const list = document.getElementById('directory-list');
            const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
            list.innerHTML = contacts.map(c => '<div onclick="document.getElementsByName('phone')[0].value=''+c.p+'';window.scrollTo(0,0)" style="background:#f8fafc; padding:10px; border-radius:12px; min-width:80px; text-align:center; border:1px solid #eee; cursor:pointer;"><div style="font-size:20px;">👤</div><div style="font-size:11px; font-weight:bold;">'+c.n+'</div></div>').join('') || '<p style="font-size:11px;color:#999;">No saved customers</p>';
        }
        loadContacts();

        function buildCalendar() {
            const grid = document.getElementById('calendar-grid');
            const now = new Date();
            const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
            let html = '';
            ['S','M','T','W','T','F','S'].forEach(d => html += '<b style="font-size:10px;color:#28a745;">'+d+'</b>');
            for(let i=1; i<=daysInMonth; i++) {
                const isToday = i === now.getDate() ? 'background:#28a745;color:white;border-radius:50%;' : '';
                html += '<div style="font-size:12px;padding:5px;'+isToday+'">'+i+'</div>';
            }
            grid.innerHTML = html;
        }
        buildCalendar();

            </script>
        </div><div id="p3" class="page"><div class="feature-card"><h3>🧮 Business Calc</h3><input type="text" id="calcDisplay" readonly style="text-align:right; font-family:monospace; background:#f8fafc;"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;"><button onclick="calc(7)" class="receipt-btn" style="padding:15px;font-size:16px;">7</button><button onclick="calc(8)" class="receipt-btn" style="padding:15px;font-size:16px;">8</button><button onclick="calc(9)" class="receipt-btn" style="padding:15px;font-size:16px;">9</button><button onclick="calc('/')" class="receipt-btn" style="padding:15px;font-size:16px;background:#e7f3ff;">÷</button><button onclick="calc(4)" class="receipt-btn" style="padding:15px;font-size:16px;">4</button><button onclick="calc(5)" class="receipt-btn" style="padding:15px;font-size:16px;">5</button><button onclick="calc(6)" class="receipt-btn" style="padding:15px;font-size:16px;">6</button><button onclick="calc('*')" class="receipt-btn" style="padding:15px;font-size:16px;background:#e7f3ff;">×</button><button onclick="calc(1)" class="receipt-btn" style="padding:15px;font-size:16px;">1</button><button onclick="calc(2)" class="receipt-btn" style="padding:15px;font-size:16px;">2</button><button onclick="calc(3)" class="receipt-btn" style="padding:15px;font-size:16px;">3</button><button onclick="calc('-')" class="receipt-btn" style="padding:15px;font-size:16px;background:#e7f3ff;">-</button><button onclick="calc(0)" class="receipt-btn" style="padding:15px;font-size:16px;">0</button><button onclick="calc('C')" class="receipt-btn" style="padding:15px;font-size:16px;background:#fff0f0;">C</button><button onclick="calc('=')" class="receipt-btn" style="padding:15px;font-size:16px;background:#28a745;color:white;">=</button><button onclick="calc('+')" class="receipt-btn" style="padding:15px;font-size:16px;background:#e7f3ff;">+</button></div></div>

    <div class='feature-card'>
        <h3 style='margin-top:0;'>🎯 Daily Sales Goal</h3><input type="number" id="goalInput" oninput="updateGoal(this.value)" placeholder="Set Goal (e.g. 5000)" style="padding:8px; font-size:12px; margin-bottom:10px; border-radius:8px; border:1px solid #eee;" onchange="localStorage.setItem('myGoal', this.value); up();">
        <div style='background:#eee; border-radius:10px; height:20px; width:100%; overflow:hidden;'>
            <div id='goalBar' style='background:#28a745; height:100%; width:0%; transition: width 1s ease;'></div>
        </div>
        <div style='display:flex; justify-content:space-between; margin-top:5px; font-size:12px; font-weight:bold;'>
            <span id='goalText'>Goal: KES 10,000</span>
            <span id='goalPercent'>0%</span>
        </div>
    </div>

    <div class='feature-card'>
        <h3 style='margin-top:0;'>⏱️ Active Session</h3>
        <div id='sessionClock' style='font-size:32px; font-weight:bold; color:#475569; text-align:center;'>00:00:00</div>
        <p style='font-size:11px; color:#999; text-align:center; margin-top:5px;'>Tracking online time for today</p>
    </div>

    <div class='feature-card' style='background: #fff; border-left: 5px solid #28a745;'>
        <h3 style='margin-top:0;'>📊 Daily Summary</h3>
        <div style='display:grid; grid-template-columns: 1fr 1fr; gap:10px;'>
            <div style='background:#f8fafc; padding:10px; border-radius:10px;'>
                <div style='font-size:10px; color:#666;'>HIGHEST</div>
                <div id='highTx' style='font-weight:bold; color:#28a745;'>KES 0</div>
            </div>
            <div style='background:#f8fafc; padding:10px; border-radius:10px;'>
                <div style='font-size:10px; color:#666;'>LOWEST</div>
                <div id='lowTx' style='font-weight:bold; color:#d9534f;'>KES 0</div>
            </div>
        </div>
    </div>

    <div class='feature-card'>
        <h3 style='margin-top:0;'>📅 Business Calendar</h3>
        <div id='calendar-grid' style='display:grid; grid-template-columns:repeat(7,1fr); gap:5px; text-align:center;'>
            </div>
        <p style='font-size:10px; color:#999; margin-top:10px; text-align:center;'>Tap a date to view archived logs (Coming Soon)</p>
    </div>

    <div class='feature-card'>
        <h3 style='margin-top:0;'>👥 Customer Directory</h3>
        <div id='directory-list' style='display:flex; gap:10px; overflow-x:auto; padding-bottom:10px;'>
            </div>
        <button onclick='addContact()' style='width:100%; padding:10px; background:#e7f3ff; color:#007bff; border:none; border-radius:10px; font-weight:bold;'>+ Save New Customer</button>
    </div>

    <div class='feature-card' style='background: linear-gradient(135deg, #1e293b, #334155); color: white;'>
        <div style='display:flex; justify-content:space-between; align-items:center;'>
            <h3 style='margin:0; font-size:14px; opacity:0.8;'>💳 Merchant Wallet</h3>
            <span style='font-size:10px; background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:10px;'>ACTIVE</span>
        </div>
        <div style='margin-top:15px;'>
            <div style='font-size:10px; opacity:0.7;'>AVAILABLE BALANCE</div>
            <div id='walletBal' style='font-size:28px; font-weight:bold;'>KES 0.00</div>
        </div>
        <div style='margin-top:15px; display:flex; gap:10px;'>
            <button style='flex:1; padding:8px; border:none; border-radius:8px; background:rgba(255,255,255,0.1); color:white; font-size:11px;'>Withdraw</button>
            <button style='flex:1; padding:8px; border:none; border-radius:8px; background:rgba(255,255,255,0.1); color:white; font-size:11px;'>Transfer</button>
        </div>
    </div>

    <div class='feature-card' style='border-left: 5px solid #64748b;'>
        <h3 style='margin-top:0;'>🔒 Privacy & Security</h3>
        <div style='display:flex; justify-content:space-between; align-items:center;'>
            <span style='font-size:12px;'>Dashboard Lock</span>
            <button onclick='alert("Security setup coming in Activation Phase")' style='background:#f1f5f9; border:none; padding:5px 15px; border-radius:20px; font-size:11px;'>ENABLE</button>
        </div>
    </div>

    <div class='feature-card' style='background:#f8fafc; border: 1px dashed #cbd5e1;'>
        <h3 style='margin-top:0;'>📞 Business Support</h3>
        <p style='font-size:11px; color:#64748b;'>Need help with your Merchant Account?</p>
        <button onclick='window.open("https://wa.me/254700000000")' style='width:100%; padding:10px; background:#25d366; color:white; border:none; border-radius:10px; font-weight:bold;'>WhatsApp Support</button>
    </div>
    
    <p style='text-align:center; font-size:10px; color:#999; margin:20px 0;'>Electronic Pay v2.0 • Secured by Paynecta</p>

    <div class='nav-bar'>
        <button class='nav-item active' onclick='showPage("p1", this)'><span>🏠</span>Home</button>
        <button class='nav-item' onclick='showPage("p2", this)'><span>📈</span>Stats</button>
        <button class='nav-item' onclick='showPage("p3", this)'><span>🛠️</span>Tools</button>
        <button class='nav-item' onclick='showPage("p4", this)'><span>⚙️</span>More</button>
    </div>
<script>
    function showPage(id, el) {
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        document.getElementById(id).classList.add("active");
        document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
        el.classList.add("active");
        window.scrollTo(0,0);
    }
</script></body>
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
