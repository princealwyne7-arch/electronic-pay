const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Define the clean Home Page structure (Engine only)
const cleanHomeHTML = `
            <div id="home" class="page active">
                <h2 style="margin: 10px 0 20px 0;">Electronic Pay</h2>
                <div class="card">
                    <div id="dailyTotal" class="total-box">Today: KES 0</div>
                    <form action="/push" method="POST">
                        <input type="password" name="password" placeholder="Manager PIN" required>
                        <input type="number" name="phone" placeholder="2547..." required>
                        <input type="number" name="amount" placeholder="Amount" required>
                        <button type="submit" class="btn-send">SEND STK PUSH</button>
                    </form>
                </div>
            </div>`;

// 2. Identify the broken area and replace it
// This regex looks for the home div and stops strictly before the Activity div starts
content = content.replace(/<div id="home" class="page active">[\s\S]*?<div id="activity"/, cleanHomeHTML + '\n            <div id="activity"');

fs.writeFileSync('server.js', content);
console.log('✅ Layout Restored: Transaction Engine is now contained to Home tab!');
