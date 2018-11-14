import Phaser from 'phaser';

export default class Portal extends Phaser.Physics.Arcade.Sprite {
  constructor({ scene, x, y }) {
    super(scene, x, y, 'portal');
  }

  preload() {}

  create() {}

  update() {}
}
