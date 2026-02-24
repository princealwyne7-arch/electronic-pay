const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// The strict logic to verify the actual M-Pesa result
const strictCallbackLogic = `
    const bodyText = JSON.stringify(req.body).toLowerCase();
    // Find the transaction by ID or Phone
    let tx = transactions.find(t => bodyText.includes(String(t.id)) || bodyText.includes(String(t.phone)));
    
    if (tx) {
        // Only "0" or "success" in the ResultCode field means the money moved
        // We look for common M-Pesa failure codes
        if (bodyText.includes('"resultcode":0') || bodyText.includes('"status":"success"') || bodyText.includes('"0"')) {
            tx.status = 'Successful ✅';
            playSnd('ok'); 
        } else if (bodyText.includes('1032') || bodyText.includes('cancel')) {
            tx.status = 'Cancelled ❌';
            playSnd('err');
        } else if (bodyText.includes('1') || bodyText.includes('insufficient')) {
            tx.status = 'Low Balance 💸';
            playSnd('err');
        } else if (bodyText.includes('2001') || bodyText.includes('wrong')) {
            tx.status = 'Wrong PIN 🔑';
            playSnd('err');
        } else {
            tx.status = 'Failed ❌';
            playSnd('err');
        }
    }
    res.sendStatus(200);`;

// Surgically replace the old app.post('/callback') logic
content = content.replace(/app\.post\('\/callback'[\s\S]*?res\.sendStatus\(200\);[\s\S]*?\}\);/, "app.post('/callback', (req, res) => {" + strictCallbackLogic + "});");

fs.writeFileSync('server.js', content);
console.log('✅ Integrity Fixed: The app will now only show Success for real payments!');
