const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Inject CSS for Search and Notification
const headerCSS = `
                .header-tools { position: absolute; top: 25px; right: 20px; display: flex; gap: 15px; z-index: 1001; }
                .tool-icon { color: white; font-size: 22px; cursor: pointer; transition: 0.3s; }
                .tool-icon:active { transform: scale(0.9); opacity: 0.7; }
                
                #search-container { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); width: 90%; display: none; z-index: 1000; animation: slideDown 0.3s ease; }
                @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }
                .search-input { width: 100%; padding: 12px 20px; border-radius: 25px; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.1); outline: none; font-size: 14px; }
`;
content = content.replace('.top-banner {', headerCSS + '\n                .top-banner {');

// 2. Inject HTML Icons into the Top Banner
const headerHTML = `
            <div class="header-tools">
                <div class="tool-icon" onclick="toggleSearch()">🔍</div>
                <div class="tool-icon" onclick="sP('activity', document.querySelectorAll('.nav-item')[1])">🔔</div>
            </div>
            <div id="search-container">
                <input type="text" class="search-input" id="searchQuery" placeholder="Search phone or amount..." onkeyup="filterHistory()">
            </div>
`;
content = content.replace('<body>', '<body>' + headerHTML);

// 3. Inject Search Logic JavaScript
const searchJS = `
                function toggleSearch() {
                    const sc = document.getElementById('search-container');
                    sc.style.display = sc.style.display === 'block' ? 'none' : 'block';
                    if(sc.style.display === 'block') document.getElementById('searchQuery').focus();
                }

                function filterHistory() {
                    const q = document.getElementById('searchQuery').value.toLowerCase();
                    const rows = document.querySelectorAll('.status-row-container'); // We will tag rows with this class
                    rows.forEach(row => {
                        row.style.display = row.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
                    });
                }
`;
content = content.replace('function sP', searchJS + '\n                function sP');

// 4. Update the Activity list mapping to support filtering
content = content.replace(
    'data.transactions.map(t =>', 
    'data.transactions.map(t => `<div class="status-row-container" style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:10px 0;">'
);
content = content.replace(').join(\'\')', ' + "</div>").join(\'\')');

fs.writeFileSync('server.js', content);
console.log('✅ Surgery Complete: Search & Notification Icons added to Header!');
