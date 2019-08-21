import Phaser from 'phaser';

import constants from '../config/constants';

const { WIDTH, HEIGHT, SCALE } = constants;

export default class PreBoot extends Phaser.Scene {
  constructor() {
    super({ key: 'PreBoot' });
  }

  preload() {
    this.loadingText = this.message('loading...');

    this.load.on('complete', function() {
      console.log('LOADED');
    });
  }

  create() {
    //load stuff
    setTimeout(() => {
      this.loadingText.text = 'Click to Start';
      this.input.on(
        'pointerdown',
        () => {
          this.scene.start('Start');
        },
        this
      );
    }, 500);
  }

  message = text => {
    return this.make
      .text({
        x: WIDTH / 2,
        y: HEIGHT / 2,
        text: text,
        style: {
          font: '20px monospace',
          fill: '#ffffff'
        }
      })
      .setOrigin(0.5, 0.5);
  };

  update(time, delta) {
    //console.log(time, delta);
  }
}
