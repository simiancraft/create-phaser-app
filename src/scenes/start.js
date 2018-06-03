import Phaser from 'phaser/src/phaser.js';
import backgroundGradient from '../assets/backgrounds/start/back-gradient.png';
import cloud1 from '../assets/backgrounds/start/cloud-1.png';
import cloud2 from '../assets/backgrounds/start/cloud-2.png';
import constants from '../config/constants';
import ground from '../assets/backgrounds/start/ground.png';
import moon from '../assets/backgrounds/start/moon.png';
import sea from '../assets/backgrounds/start/sea.png';

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
  }
  create() {
    this.add
      .image(center.width, center.height, 'back-gradient')
      .setScale(assetScale);
    this.add.image(center.width, center.height, 'sea').setScale(assetScale);

    this.add
      .image(center.width * 1.6, center.height * 0.4, 'moon')
      .setScale(assetScale);

    this.add.image(center.width, center.height, 'ground').setScale(assetScale);
  }
  update() {}
  render() {}
}
