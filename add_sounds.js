const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Add Audio HTML & Settings to the "More" Tab
const soundSettingsHTML = `
                <div class="card">
                    <p style="color: #64748b; font-size: 14px; font-weight: bold; margin-bottom: 15px;">🔔 Notification Sounds</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span>Enable Audio</span>
                        <input type="checkbox" id="soundToggle" checked style="width: auto; margin: 0;">
                    </div>
                    <div style="text-align: left; font-size: 13px;">
                        <label>Success Tone:</label>
                        <select id="successSoundSelect" style="width: 100%; padding: 8px; margin: 5px 0 15px 0; border-radius: 8px; border: 1px solid #ddd;">
                            <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">Classic Chime ✅</option>
                            <option value="https://cdn.pixabay.com/audio/2022/03/10/audio_c352c858c2.mp3">Digital Payment 📱</option>
                        </select>
                        <label>Error/Cancel Tone:</label>
                        <select id="errorSoundSelect" style="width: 100%; padding: 8px; margin: 5px 0 0 0; border-radius: 8px; border: 1px solid #ddd;">
                            <option value="https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3">Alert Titititi ⚠️</option>
                            <option value="https://cdn.pixabay.com/audio/2021/08/04/audio_0625d15d1c.mp3">Error Buzz ❌</option>
                        </select>
                    </div>
                </div>
`;
content = content.replace('<h2>Settings</h2>', '<h2>Settings</h2>' + soundSettingsHTML);

// 2. Inject Audio Playback Logic into updateStatus()
const soundJS = `
                let playedIds = new Set();
                function playNotification(type) {
                    if (!document.getElementById('soundToggle').checked) return;
                    const url = type === 'success' ? document.getElementById('successSoundSelect').value : document.getElementById('errorSoundSelect').value;
                    const audio = new Audio(url);
                    audio.play().catch(e => console.log("Audio blocked: tap screen first"));
                }
`;
content = content.replace('async function updateStatus() {', soundJS + '\n                async function updateStatus() {');

// 3. Trigger Sound inside the loop
const triggerSoundCode = `
                        data.transactions.forEach(t => {
                            if (!playedIds.has(t.id)) {
                                if (t.status.includes('Successful')) {
                                    playNotification('success');
                                    playedIds.add(t.id);
                                } else if (t.status.includes('Cancelled') || t.status.includes('Failed') || t.status.includes('Wrong')) {
                                    playNotification('error');
                                    playedIds.add(t.id);
                                }
                            }
                        });
`;
content = content.replace('document.getElementById(\'dailyTotal\').innerText', triggerSoundCode + '\n                        document.getElementById(\'dailyTotal\').innerText');

fs.writeFileSync('server.js', content);
console.log('✅ Sound System Integrated!');
