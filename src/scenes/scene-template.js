import { HEIGHT, SCALE, WIDTH } from '../config/constants';

import Phaser from 'phaser/src/phaser.js';

export default class sceneTemplate extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }
  preload() {}
  create() {}
  update() {}
  render() {}
}
