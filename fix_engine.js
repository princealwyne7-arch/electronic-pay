const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Restore the Paynecta Push Engine
const pushLogic = `try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: PAYMENT_CODE, mobile_number: phone, amount: amount, email: "princealwyne7@gmail.com",
            callback_url: "https://" + req.get('host') + "/callback"
        }, { headers: { 'X-API-Key': PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        const trackingId = response.data.merchant_request_id || response.data.transaction_id || response.data.request_id || Date.now();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send("API Error: " + err.message); }`;

content = content.replace(/app\.post\('\/push'[\s\S]*?res\.redirect\('\/'\);[\s\S]*?\}\);/, "app.post('/push', async (req, res) => { const { phone, amount, password } = req.body; if (password !== '5566') return res.send('Invalid PIN'); " + pushLogic + " });");

// 2. Fix the Callback status translation
const callbackLogic = `const bodyText = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyText.includes(String(t.id)) || bodyText.includes(String(t.phone)));
    if (tx) { 
        const data = bodyText.toLowerCase();
        if (data.includes('"success"') || data.includes('"completed"') || data.includes('"0"')) tx.status = 'Successful ✅';
        else if (data.includes('cancel') || data.includes('1032')) tx.status = 'Cancelled ❌';
        else tx.status = 'Failed ❌';
    }
    res.sendStatus(200);`;

content = content.replace(/app\.post\('\/callback'[\s\S]*?res\.sendStatus\(200\);[\s\S]*?\}\);/, "app.post('/callback', (req, res) => { " + callbackLogic + " });");

fs.writeFileSync('server.js', content);
console.log('✅ Surgery Complete: M-Pesa Engine Restored!');
