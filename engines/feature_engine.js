const FeatureEngine = {
    sounds: {
        1: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_1.mp3',
        2: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_2.mp3',
        3: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_3.mp3',
        4: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_4.mp3',
        5: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_5.mp3',
        6: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_6.mp3',
        7: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_7.mp3',
        8: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_8.mp3',
        9: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_9.mp3',
        10: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_10.mp3',
        11: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_11.mp3',
        12: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_12.mp3',
        13: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_13.mp3',
        14: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_14.mp3',
        15: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_15.mp3'
    },
    getSound: (idx) => FeatureEngine.sounds[idx] || FeatureEngine.sounds[1]
};
module.exports = FeatureEngine;
