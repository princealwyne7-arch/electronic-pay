const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Add CSS - Injecting precisely at the start of the <style> block
const toolCSS = `
                .header-tools { position: absolute; top: 25px; right: 20px; display: flex; gap: 15px; z-index: 1001; }
                .tool-icon { color: white; font-size: 22px; cursor: pointer; }
                #search-box { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); width: 90%; display: none; z-index: 1000; }
                .s-input { width: 100%; padding: 12px; border-radius: 20px; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
`;
content = content.replace('<style>', '<style>' + toolCSS);

// 2. Add HTML - Injecting precisely after the opening <body> tag
const toolHTML = `
            <div class="header-tools">
                <div class="tool-icon" onclick="tglS()">🔍</div>
                <div class="tool-icon" onclick="sP('activity', document.querySelectorAll('.nav-item')[1])">🔔</div>
            </div>
            <div id="search-box"><input type="text" class="s-input" id="sq" placeholder="Search transactions..." onkeyup="fltr()"></div>
`;
if (!content.includes('header-tools')) {
    content = content.replace('<body>', '<body>' + toolHTML);
}

// 3. Add JS Functions - Injecting at the end of the script block
const toolJS = `
                function tglS() { 
                    let b = document.getElementById('search-box'); 
                    b.style.display = b.style.display === 'block' ? 'none' : 'block'; 
                }
                function fltr() {
                    let q = document.getElementById('sq').value.toLowerCase();
                    document.querySelectorAll('#history-list div').forEach(r => {
                        r.style.display = r.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
                    });
                }
`;
content = content.replace('</script>', toolJS + '\n            </script>');

fs.writeFileSync('server.js', content);
console.log('✅ Surgical Update Successful: Header Tools Added!');
