const express=require('express'),axios=require('axios');require('dotenv').config();const app=express();app.use(express.json());app.use(express.urlencoded({extended:true}));
let txs=[];
app.get('/',(req,res)=>{res.send(`<html><body style="text-align:center;font-family:sans-serif;padding:20px;">
<img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:100px;border-radius:50%;border:3px solid green;">
<h2>Electronic Pay</h2>
<form action="/push" method="POST">
<input type="password" name="pw" placeholder="PIN" style="width:100%;padding:15px;margin:5px 0;">
<input type="number" name="ph" placeholder="254..." style="width:100%;padding:15px;margin:5px 0;">
<input type="number" name="am" placeholder="Amount" style="width:100%;padding:15px;margin:5px 0;">
<button type="submit" style="width:100%;padding:15px;background:green;color:white;border:none;border-radius:10px;">SEND STK</button>
</form></body></html>`)});
app.post('/push',async(req,res)=>{
const{ph,am,pw}=req.body;if(pw!=="5566")return res.send("PIN Error");
try{await axios.post('https://paynecta.co.ke/api/v1/payment/initialize',{code:process.env.PAYMENT_CODE,mobile_number:ph,amount:am,email:"p@mail.com",callback_url:"https://electronic-pay.onrender.com/callback"},{headers:{'X-API-Key':process.env.PAYNECTA_KEY}});res.send("<h1>STK SENT!</h1><a href='/'>Go Back</a>");
}catch(e){res.status(500).send(e.message)}});
app.listen(process.env.PORT||3000);
