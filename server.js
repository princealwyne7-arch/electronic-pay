const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

let transactions = [];
let authSession = { active: false, expiry: 0 };
const P_KEY = 'hmp_AegEZDHxA8uOAel2wp3ttkpK4FeBPwVa6bNiJcfE';
const P_CODE = 'PNT_957342';

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/status', (req, res) => {
    const total = transactions.filter(t => t.status.includes('Successful')).reduce((s, t) => s + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal: total });
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    const now = Date.now();
    let auth = (password === '5566');

    if (auth) {
        authSession = { active: true, expiry: now + 300000 };
    } else if (authSession.active && now < authSession.expiry) {
        auth = true;
    }

    if (!auth) return res.status(401).send('Invalid PIN');

    try {
        const r = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: P_CODE, mobile_number: phone, amount: amount,
            email: 'princealwyne7@gmail.com', callback_url: 'https://electronic-pay.onrender.com/callback'
        }, { headers: { 'X-API-Key': P_KEY } });
        
        const tid = response.data.merchant_request_id || response.data.transaction_id || phone;
        transactions.unshift({ id: tid, phone, amount, status: 'Processing... 🔄', time: new Date().toLocaleTimeString() });
        res.redirect('/');
    } catch (e) { res.status(500).send('Error'); }
});

app.listen(process.env.PORT || 3000);
