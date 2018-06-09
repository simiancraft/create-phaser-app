import Phaser from 'phaser/src/phaser.js';

import backgroundGradient from '../assets/backgrounds/start/back-gradient.png';
import cloud1 from '../assets/backgrounds/start/cloud-1.png';
import cloud2 from '../assets/backgrounds/start/cloud-2.png';
import ground from '../assets/backgrounds/start/ground.png';
import moon from '../assets/backgrounds/start/moon.png';
import sea from '../assets/backgrounds/start/sea.png';
import wallkingDragonAnimations from '../assets/creatures/walking-dragon/walking-dragon.json';
import walkingDragonImage from '../assets/creatures/walking-dragon/walking-dragon.png';
import playerStill from '../assets/player/player-image.png';
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
    super({ key: 'Game' });
  }

  preload() {
    this.load.image('back-gradient', backgroundGradient);
    this.load.image('moon', moon);
    this.load.image('sea', sea);
    this.load.image('cloud-1', cloud1);
    this.load.image('cloud-2', cloud2);
    this.load.image('ground', ground);
    this.load.image('player-still', playerStill);
    this.load.image(
      'knighthawks',
      'http://labs.phaser.io/assets/fonts/retro/knight3.png'
    );

    this.load.audio('example_sound', [exampleSoundOgg]);

    this.load.atlas({
      key: 'walking-dragon',
      textureURL: walkingDragonImage,
      atlasURL: wallkingDragonAnimations
    });

    console.log(wallkingDragonAnimations);
  }
  create() {
    this.add
      .image(center.width, center.height, 'back-gradient')
      .setScale(assetScale);
    this.add.image(center.width, center.height, 'sea').setScale(assetScale);
    this.add
      .image(center.width * 1.6, center.height * 0.4, 'moon')
      .setScale(assetScale);
    this.addClouds();
    this.add.image(center.width, center.height, 'ground').setScale(assetScale);
    //this.add.image(center.width, center.height + 33, 'player-still');
    // .setScale(assetScale);
    this.makeText();

    this.exampleSound = this.sound.add('example_sound');
    this.time.delayedCall(2000, () => {
      this.exampleSound.play();
    });

    this.makeAnimations();

    this.player = this.add
      .sprite(center.width, center.height, 'walking-dragon')
      .setScale(0.2);
  }
  update() {
    this.moveClouds();
    this.cursors = this.input.keyboard.createCursorKeys();

    if (this.cursors.left.isDown) {
      //this.player.x = -0.1;
      //console.log(this.player.anims);
      this.player.anims.play('walk-left', true);
      this.player.direction = 'left';
    }
  }
  render() {}

  makeText() {
    this.titleText = this.add
      .text(center.width, center.height * 0.25, 'Create Phaser App', {
        fill: '#ffffff',
        font: '30px Rajdhani'
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

    console.log(this.titleText);
  }

  makeAnimations() {
    const FRAMERATE = 24;
    const ONESHOT = 0;

    this.anims.create({
      key: 'falling',
      frames: this.anims.generateFrameNames('walking-dragon', {
        start: 0,
        end: 5,
        prefix: 'Dragon_fall_',
        suffix: '.png'
      }),
      frameRate: FRAMERATE,
      repeat: -1
    });

    const walkFrames = this.anims.generateFrameNames('walking-dragon', {
      start: 0,
      end: 20,
      zeroPad: 2,
      prefix: 'Dragon_walk_',
      suffix: '.png'
    });

    console.log(walkFrames);

    this.anims.create({
      key: 'walk-left',
      frames: walkFrames,
      frameRate: FRAMERATE,
      repeat: -1
    });

    console.log(this.anims);
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
