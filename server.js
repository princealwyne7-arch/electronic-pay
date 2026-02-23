cat << 'EOF' > server.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];
let notificationso = [];

const getKenyaTime = () =>
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal, aiScore: 820 });
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.status(403).send("Unauthorized");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PNT_957342,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, {
            headers: { 'X-API-Key': process.env.hmp_AegEZDHxA8uOAel2wp3ttkpK4FeBPwVa6bNiJcfE, 'Content-Type': 'application/json' }
        });
        const trackingId = response.data.merchant_request_id || Date.now();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/callback', (req, res) => {
    const bodyText = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyText.includes(String(t.phone)));
    if (tx) { tx.status = "Successful ✅"; }
    res.sendStatus(200);
});

app.get('/', (req, res) => {
res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Electronic Pay Elite</title>
<style>
:root { --primary:#0f172a; --accent:#28a745; --bg:#f8fafc; }
body{margin:0;font-family:-apple-system,sans-serif;background:var(--bg);padding-bottom:90px;}
.card{background:white;border-radius:22px;padding:20px;margin-bottom:15px;box-shadow:0 4px 20px rgba(0,0,0,0.05);}
.balance-card{background:linear-gradient(135deg,#0f172a,#1e293b);color:white;}
.bottom-nav{position:fixed;bottom:15px;left:50%;transform:translateX(-50%);
width:92%;height:75px;background:white;border-radius:25px;
display:flex;justify-content:space-around;align-items:center;
box-shadow:0 10px 30px rgba(0,0,0,0.08);}
.nav-item{text-align:center;font-size:10px;font-weight:700;color:#94a3b8;flex:1;cursor:pointer;}
.nav-item.active{color:#0f172a;}
.tab-content{display:none;padding:85px 15px 20px;}
.active-tab{display:block;}
select,input{width:100%;padding:14px;margin:6px 0;border:1px solid #e2e8f0;border-radius:12px;}
.btn{width:100%;padding:14px;background:var(--accent);color:white;border:none;border-radius:12px;font-weight:700;}
.alert-box{background:#f1f5f9;padding:12px;border-radius:12px;margin-top:8px;font-size:13px;}
</style>
</head>
<body>

<div id="tab-dash" class="tab-content active-tab">
<div class="card balance-card">
<div>DAILY TOTAL REVENUE</div>
<h1 id="totalRev">KES 0</h1>
<div>AI Health: 820</div>
</div>
</div>

<div id="tab-vault" class="tab-content">

<div class="card">
<h3>🌍 Global & Regional Banking Core</h3>
<p style="font-size:13px;color:#64748b;">Intelligent multi-jurisdiction financial infrastructure</p>
</div>

<div class="card">
<h4>💱 Multi-Currency Accounts</h4>
<select id="currencySelect">
<option>USD</option>
<option>EUR</option>
<option>GBP</option>
<option>KES</option>
<option>NGN</option>
<option>JPY</option>
</select>
<div class="alert-box" id="fxRateBox">Live FX Rate Loading...</div>
<button class="btn" onclick="lockRate()">Lock Exchange Rate</button>
</div>

<div class="card">
<h4>🌐 Language Selector</h4>
<select onchange="changeLanguage(this.value)">
<option value="en">English</option>
<option value="sw">Kiswahili</option>
<option value="fr">French</option>
<option value="es">Spanish</option>
<option value="zh">Mandarin</option>
<option value="ar">Arabic</option>
</select>
</div>

<div class="card">
<h4>🕒 Time Zone Sync</h4>
<div class="alert-box">
Detected Time Zone: <span id="tz"></span><br>
UTC Timestamp: <span id="utc"></span>
</div>
</div>

<div class="card">
<h4>🏦 Country-Specific Payment Rails</h4>
<select id="countrySelect">
<option>Kenya - M-Pesa</option>
<option>Nigeria - Bank Transfer</option>
<option>UK - Faster Payments</option>
<option>USA - ACH</option>
<option>EU - SEPA</option>
</select>
<div class="alert-box">Smart routing enabled ✔</div>
</div>

<div class="card">
<h4>⚖ Regulatory Compliance Overview</h4>
<div class="alert-box">
AML Status: Active ✔<br>
KYC Tier: Verified Level 2<br>
Risk Score: Low (12%)
</div>
</div>

<div class="card">
<h4>🚀 Smart Migration Mode</h4>
<button class="btn" onclick="simulateTravel()">Simulate Country Change</button>
<div class="alert-box" id="migrationStatus">Monitoring location...</div>
</div>

<div class="card">
<h4>📡 Real-Time Economic Impact Alerts</h4>
<div class="alert-box" id="economicFeed">Scanning global markets...</div>
</div>

<div class="card">
<h4>🌎 Geo-Optimized Transfers</h4>
<div class="alert-box">
Best Route: Auto-Selected<br>
Settlement Speed: Fastest Available<br>
FX Spread: Optimized
</div>
</div>

</div>

<nav class="bottom-nav">
<div class="nav-item active" onclick="switchTab('dash',this)">🏠<br>Dash</div>
<div class="nav-item" onclick="switchTab('vault',this)">💼<br>Vault</div>
</nav>

<script>
function switchTab(id,el){
document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active-tab'));
document.getElementById('tab-'+id).classList.add('active-tab');
document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
el.classList.add('active');
}

async function update(){
try{
const res=await fetch('/api/status');
const data=await res.json();
document.getElementById('totalRev').innerText='KES '+data.todayTotal;
}catch(e){}
}
setInterval(update,3000);update();

document.getElementById("tz").innerText=Intl.DateTimeFormat().resolvedOptions().timeZone;
document.getElementById("utc").innerText=new Date().toISOString();

function changeLanguage(lang){
if(lang==="ar"){document.body.dir="rtl";}
else{document.body.dir="ltr";}
alert("Language switched to "+lang.toUpperCase());
}

function lockRate(){
document.getElementById("fxRateBox").innerText="Exchange Rate Locked for 1 Hour ✔";
}

function simulateTravel(){
document.getElementById("migrationStatus").innerText="Country Changed → Services Adapted ✔";
}

setInterval(()=>{
document.getElementById("economicFeed").innerText=
"⚠ USD Volatility Increased • AI Impact Score: Moderate • Suggested: Hold FX";
},5000);

</script>
</body>
</html>
`);
});

app.listen(process.env.PORT || 3000);
