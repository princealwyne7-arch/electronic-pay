const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

// 1. STYLE: Add professional positioning
const bellStyle = `
    .header-tools { position: absolute; top: 25px; right: 25px; z-index: 1001; }
    .tool-icon { color: white; font-size: 24px; cursor: pointer; }
`;
if (!c.includes('.header-tools')) {
    c = c.replace('</style>', bellStyle + '</style>');
}

// 2. HTML: Inject the Bell Icon
const bellHTML = `
    <div class="header-tools">
        <div class="tool-icon" onclick="sP('activity', document.querySelectorAll('.nav-item')[1])">🔔</div>
    </div>
`;
if (!c.includes('header-tools')) {
    c = c.replace('<body>', '<body>' + bellHTML);
}

fs.writeFileSync('server.js', c);
console.log('✅ Notification Bell Surgically Injected!');
