const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Ensure the Engine is contained in Home (Fixes the 'bleeding' issue)
const homeStart = '<div id="home" class="page active">';
const activityStart = '<div id="activity" class="page">';
if (content.includes(homeStart) && content.includes(activityStart)) {
    const parts = content.split(homeStart);
    const subParts = parts[1].split(activityStart);
    const cleanHome = `
                <h2>Electronic Pay</h2>
                <div class="card">
                    <div id="dailyTotal" class="total-box">Today: KES 0</div>
                    <form action="/push" method="POST">
                        <input type="password" name="password" placeholder="Manager PIN" required>
                        <input type="number" name="phone" placeholder="2547..." required>
                        <input type="number" name="amount" placeholder="Amount" required>
                        <button type="submit" class="btn-send">SEND STK PUSH</button>
                    </form>
                </div>
            </div>\n            `;
    content = parts[0] + homeStart + cleanHome + activityStart + subParts[1];
}

// 2. Add Search and Notification Icons to Header
if (!content.includes('header-tools')) {
    const toolsHTML = `
            <div class="header-tools">
                <div class="tool-icon" onclick="tglS()">🔍</div>
                <div class="tool-icon" onclick="sP('activity', document.querySelectorAll('.nav-item')[1])">🔔</div>
            </div>
            <div id="search-box"><input type="text" class="s-input" id="sq" placeholder="Search..." onkeyup="fltr()"></div>`;
    content = content.replace('<body>', '<body>' + toolsHTML);
}

// 3. Update the JavaScript for truth and sounds
const newJS = `
                function tglS() { let b = document.getElementById('search-box'); b.style.display = b.style.display === 'block' ? 'none' : 'block'; }
                function fltr() {
                    let q = document.getElementById('sq').value.toLowerCase();
                    document.querySelectorAll('.status-row').forEach(r => {
                        r.style.display = r.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
                    });
                }
`;
content = content.replace('function sP', newJS + '\n                function sP');

fs.writeFileSync('server.js', content);
console.log('✅ Professional Build Secured and Updated!');
