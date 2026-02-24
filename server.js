const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];

/* DIGITAL ASSETS MODULE */
let digitalAssets = [
 {name:"Bitcoin",symbol:"BTC",balance:0},
 {name:"Ethereum",symbol:"ETH",balance:0},
 {name:"USDT",symbol:"USDT",balance:0}
];

const getKenyaTime = () => 
 new Date().toLocaleTimeString('en-GB',{timeZone:'Africa/Nairobi',hour:'2-digit',minute:'2-digit'});

app.get('/api/status',(req,res)=>{
 const successfulTxs = transactions.filter(t=>t.status.includes('Successful'));
 const todayTotal = successfulTxs.reduce((sum,t)=>sum+parseInt(t.amount||0),0);
 const aiScore = Math.min(999,800+(successfulTxs.length*12));
 res.json({transactions,todayTotal,aiScore,latency:Math.floor(Math.random()*35)+10});
});

/* DIGITAL ASSETS API */
app.get('/api/assets',(req,res)=>{
res.json(digitalAssets);
});

app.post('/admin/push', async (req,res)=>{
 const {phone,amount,pin}=req.body;

 if(pin!=="5566")
 return res.status(403).json({error:"Access Denied"});

 const trackingId=`BNK-${Date.now()}`;

 transactions.unshift({
 id:trackingId,
 phone,
 amount,
 status:'Processing... 🔄',
 time:getKenyaTime()
 });

 try{

 await axios.post(
 'https://paynecta.co.ke/api/v1/payment/initialize',
 {
 code:process.env.PAYMENT_CODE,
 mobile_number:phone,
 amount:amount,
 email:"princealwyne7@gmail.com",
 callback_url:"https://electronic-pay.onrender.com/callback"
 },
 {
 headers:{
 'X-API-Key':process.env.PAYNECTA_KEY,
 'Content-Type':'application/json'
 }
 }
 );

 res.json({success:true,trackingId});

 }catch(err){

 if(transactions[0])
 transactions[0].status="Failed ❌";

 res.status(500).json({success:false});

 }

});

app.post('/callback',(req,res)=>{

 const {merchant_request_id,state,status}=req.body;

 let tx=transactions.find(t=>String(t.id).includes(merchant_request_id));

 if(tx){

 tx.status=
 (state==='completed'||status==='success')
 ?
 "Successful ✅"
 :
 "Cancelled ⚠️";

 }

 res.sendStatus(200);

});


app.get('/',(req,res)=>{
res.send(`

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Electronic Pay Elite</title>

<style>

body{
margin:0;
font-family:-apple-system,sans-serif;
background:#f8fafc;
padding-bottom:90px;
}

.tab-content{
display:none;
padding:80px 15px;
}

.active-tab{
display:block;
}

.card{
background:white;
border-radius:20px;
padding:20px;
margin-bottom:15px;
box-shadow:0 4px 20px rgba(0,0,0,0.04);
}

.vault-grid{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:12px;
margin-top:15px;
}

.v-item{
background:white;
padding:18px;
border-radius:20px;
border:1px solid #eee;
text-align:center;
}

.nav{
position:fixed;
bottom:0;
left:0;
width:100%;
height:70px;
background:white;
display:flex;
justify-content:space-around;
align-items:center;
box-shadow:0 -2px 10px rgba(0,0,0,0.05);
}

</style>

</head>


<body>



<div id="tab-dash" class="tab-content active-tab">

<div class="card">

<h3>Total Volume</h3>

<h1 id="totalRev">KES 0</h1>

</div>

</div>




<div id="tab-vault" class="tab-content">

<div class="vault-grid">


<div class="v-item" onclick="openAssets();playSfx(5)">

💎<br>

Assets<br>

Crypto Keys

</div>


</div>

</div>




<nav class="nav">

<div onclick="switchTab('dash')">

Dash

</div>

<div onclick="switchTab('vault')">

Vault

</div>

</nav>



<script>

function switchTab(id){

document.querySelectorAll('.tab-content')
.forEach(t=>t.classList.remove('active-tab'));

document.getElementById('tab-'+id)
.classList.add('active-tab');

}



async function update(){

const res=await fetch('/api/status');

const data=await res.json();

document.getElementById('totalRev').innerText=
"KES "+data.todayTotal;

}

setInterval(update,3000);

update();



function playSfx(i){}



async function openAssets(){

const res = await fetch('/api/assets');

const data = await res.json();

alert(
data.map(a =>
a.name+" "+a.symbol+
" Balance:"+a.balance
).join("\\n")
);

}


</script>



</body>

</html>

`);
});


app.listen(process.env.PORT||3000);

