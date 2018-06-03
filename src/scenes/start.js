import { HEIGHT, SCALE, WIDTH } from '../config/constants';

import Phaser from 'phaser/src/phaser.js';
import backgroundGradient from '../assets/backgrounds/start/back-gradient.png';
import cloud1 from '../assets/backgrounds/start/cloud-1.png';
import cloud2 from '../assets/backgrounds/start/cloud-2.png';
import moon from '../assets/backgrounds/start/moon.png';
import sea from '../assets/backgrounds/start/sea.png';

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
  }
  create() {
    this.add.image(WIDTH, HEIGHT, 'back-gradient');
  }
  update() {}
  render() {}
}
