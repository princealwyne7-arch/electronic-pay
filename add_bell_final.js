const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');
const bellStyle = '.header-tools{position:absolute;top:25px;right:25px;z-index:1001}.tool-icon{color:white;font-size:24px;cursor:pointer}';
if(!c.includes('.header-tools')){c=c.replace('</style>', bellStyle+'</style>')}
const bellHTML = '<div class="header-tools"><div class="tool-icon" onclick="sP(\'activity\', document.querySelectorAll(\'.nav-item\')[1])">🔔</div></div>';
if(!c.includes('header-tools')){c=c.replace('<body>', '<body>'+bellHTML)}
fs.writeFileSync('server.js', c);
console.log('✅ File Updated Locally!');
