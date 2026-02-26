const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Remove the old Top-Right Icon and Sidebar
content = content.replace(/<div class="calc-btn".*?<\/div>/, '');
content = content.replace(/<div class="calc-sidebar".*?<\/div>[\s\S]*?<\/div>/, '');

// 2. Add the Calculator Page HTML before the "More" tab
const calcPageHTML = `
            <div id="calculator" class="page">
                <h2 style="margin: 10px 0 20px 0;">Financial Tools</h2>
                <div class="card" style="background: #1e293b; padding: 20px;">
                    <input type="text" id="calc-display-tab" readonly value="0" 
                        style="background: #0f172a; color: #10b981; border: none; height: 70px; font-size: 30px; margin-bottom: 20px; text-align: right;">
                    <div class="calc-grid">
                        <button onclick="calcClearTab()" style="background:#ef4444;">C</button>
                        <button onclick="calcInTab('/')" class="op">÷</button>
                        <button onclick="calcInTab('*')" class="op">×</button>
                        <button onclick="calcInTab('-')" class="op">-</button>
                        <button onclick="calcInTab('7')">7</button><button onclick="calcInTab('8')">8</button><button onclick="calcInTab('9')">9</button>
                        <button onclick="calcInTab('+')" class="op">+</button>
                        <button onclick="calcInTab('4')">4</button><button onclick="calcInTab('5')">5</button><button onclick="calcInTab('6')">6</button>
                        <button onclick="calcInTab('1')">1</button><button onclick="calcInTab('2')">2</button><button onclick="calcInTab('3')">3</button>
                        <button onclick="calcInTab('0')">0</button><button onclick="calcInTab('.')">.</button>
                        <button onclick="calcResultTab()" class="eq" style="background: #10b981; grid-column: span 2;">=</button>
                    </div>
                </div>
            </div>
`;
content = content.replace('', calcPageHTML + '\n            ');

// 3. Update the Bottom Navigation Bar to include the Calculator
const navUpdate = `
                <a href="javascript:void(0)" class="nav-item" onclick="showPage('calculator', this)">
                    <span class="nav-icon">🧮</span><span>Calc</span>
                </a>
                <a href="javascript:void(0)" class="nav-item" onclick="showPage('more', this)">
`;
content = content.replace('<a href="javascript:void(0)" class="nav-item" onclick="showPage(\'more\', this)">', navUpdate);

// 4. Add the Calculator Tab Functions
const calcTabJS = `
                function calcInTab(v) { 
                    let d = document.getElementById('calc-display-tab');
                    if(d.value === '0') d.value = v; else d.value += v;
                }
                function calcClearTab() { document.getElementById('calc-display-tab').value = '0'; }
                function calcResultTab() {
                    try { document.getElementById('calc-display-tab').value = eval(document.getElementById('calc-display-tab').value); }
                    catch(e) { document.getElementById('calc-display-tab').value = 'Error'; }
                }
`;
content = content.replace('function toggleMenu() {', calcTabJS + '\n                function toggleMenu() {');

fs.writeFileSync('server.js', content);
console.log('✅ Calculator successfully moved to Navigation Bar!');
