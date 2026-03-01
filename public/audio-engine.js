const bankSfx = new Howl({
  src: ['https://raw.githubusercontent.com/princealwyne7-arch/assets/main/master_sfx_bank.mp3'],
  sprite: {
    fx1: [0, 800], fx2: [900, 800], fx3: [1800, 800], fx4: [2700, 800],
    fx5: [3600, 800], fx6: [4500, 800], fx7: [5400, 800], fx8: [6300, 800],
    fx9: [7200, 800], fx10: [8100, 800], fx11: [9000, 800], fx12: [9900, 800],
    fx13: [10800, 800], fx14: [11700, 800], fx15: [12600, 800]
  }
});
function playEliteSound(id) { bankSfx.play('fx' + id); }
