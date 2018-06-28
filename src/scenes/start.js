import Phaser from 'phaser';

import backgroundGradientTitle from '../assets/backgrounds/start/back-gradient.png';
import cloud1 from '../assets/backgrounds/start/cloud-1.png';
import cloud2 from '../assets/backgrounds/start/cloud-2.png';
import ground from '../assets/backgrounds/start/ground.png';
import moonTitle from '../assets/backgrounds/start/moon.png';
import seaTitle from '../assets/backgrounds/start/sea.png';
import playerStill from '../assets/player-image.png';
import exampleSoundOgg from '../assets/sounds/example_sound.ogg';
import constants from '../config/constants';
import { linearScale } from '../utils';

const { WIDTH, HEIGHT, SCALE } = constants;

const center = {
  width: WIDTH * 0.5,
  height: HEIGHT * 0.5
};

const assetScale = SCALE * 2;

export default class Start extends Phaser.Scene {
  constructor() {
    super({ key: 'Start' });
  }

  preloadBackground() {
    this.load.image('back-gradient-title', backgroundGradientTitle);
    this.load.image('moon-title', moonTitle);
    this.load.image('sea-title', seaTitle);
  }

  createBackground(scale) {
    const center = {
      width: WIDTH * 0.5,
      height: HEIGHT * 0.5
    };
    this.add
      .image(center.width, center.height, 'back-gradient-title')
      .setScale(scale);
    this.add.image(center.width, center.height, 'sea-title').setScale(scale);
    this.add
      .image(center.width * 1.6, center.height * 0.4, 'moon-title')
      .setScale(scale);
  }

  preload() {
    this.preloadBackground();
    this.load.image('cloud-1', cloud1);
    this.load.image('cloud-2', cloud2);
    this.load.image('ground', ground);
    this.load.image('player-still', playerStill);
    this.load.image(
      'knighthawks',
      'http://labs.phaser.io/assets/fonts/retro/knight3.png'
    );

    this.load.audio('example_sound', [exampleSoundOgg]);
  }
  create() {
    this.createBackground(assetScale);
    this.addClouds();
    this.add.image(center.width, center.height, 'ground').setScale(assetScale);
    this.add
      .image(center.width, center.height * 1.3, 'player-still')
      .setScale(assetScale);
    this.makeText();

    this.exampleSound = this.sound.add('example_sound');
    this.time.delayedCall(2000, () => {
      this.exampleSound.play();
    });

    this.input.on('pointerdown', this.startGame, this);
  }
  update() {
    this.moveClouds();
  }
  render() {}

  startGame() {
    this.scene.stop('Game');
    this.scene.start('Game');
  }

  makeText() {
    this.titleText = this.add
      .text(center.width, center.height * 0.25, 'Create Phaser App', {
        fill: '#ffffff',
        font: `${46 * SCALE}px Rajdhani`
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    this.textTween = this.tweens.add({
      targets: this.titleText,
      alpha: {
        value: 1,
        delay: 1000,
        duration: 4000
      }
    });
  }

  addClouds() {
    this.clouds = [];

    let distance = 2.2;

    this.clouds.push({
      cloud: this.add
        .image(
          center.width - distance * 60,
          center.height / distance,
          'cloud-1'
        )
        .setScale(assetScale / distance),
      distance: distance
    });

    distance = 2;

    this.clouds.push({
      cloud: this.add
        .image(
          center.width + distance * 60,
          center.height / distance,
          'cloud-2'
        )
        .setScale(assetScale / distance),
      distance: distance
    });

    distance = 1.6;

    this.clouds.push({
      cloud: this.add
        .image(
          center.width - distance * 60,
          center.height / distance,
          'cloud-1'
        )
        .setScale(assetScale / distance),
      distance: distance
    });

    distance = 1.2;
    this.clouds.push({
      cloud: this.add
        .image(
          center.width + distance * 60,
          center.height / distance,
          'cloud-2'
        )
        .setScale(assetScale / distance),
      distance: distance
    });

    distance = 1;

    this.clouds.push({
      cloud: this.add
        .image(
          center.width - distance * 60,
          center.height / distance,
          'cloud-1'
        )
        .setScale(assetScale / distance),
      distance: distance
    });

    this.scaleSpeed = linearScale([1, 2.2], [0.2, 0.05]);
  }

  moveClouds() {
    const rightBound = WIDTH * 1.25;
    const leftBound = -WIDTH * 0.25;

    this.clouds.forEach(({ cloud, distance }) => {
      if (cloud.x > rightBound) {
        cloud.x = leftBound;
      } else {
        cloud.x += this.scaleSpeed(distance);
      }
    });
  }
}
