import Phaser from 'phaser';

import constants from '../config/constants';

const { WIDTH, HEIGHT, SCALE } = constants;

export default class PreBoot extends Phaser.Scene {
  constructor() {
    super({ key: 'PreBoot' });
  }

  preload() {
    var loadingText = this.make.text({
      x: WIDTH / 2,
      y: HEIGHT / 2,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('complete', function() {
      console.log('LOADED');
    });
  }

  create() {
    setTimeout(() => {
      this.scene.start('Start');
    }, 250);
  }

  update(time, delta) {
    //console.log(time, delta);
  }
}
