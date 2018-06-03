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

    this.addClouds();

    this.add.image(center.width, center.height, 'ground').setScale(assetScale);
  }
  update() {
    this.moveClouds();
  }
  render() {}

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
  }

  moveClouds() {
    const rightBound = WIDTH * 1.25;
    const leftBound = -WIDTH * 0.25;

    this.clouds.forEach(({ cloud, distance }) => {
      if (cloud.x > rightBound) {
        cloud.x = leftBound;
      } else {
        cloud.x += (2.3 - distance) * 0.2;
      }
    });
  }
}
