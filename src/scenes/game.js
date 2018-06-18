import Phaser from 'phaser/src/phaser.js';

import rockTilemap from '../assets/levels/rock-tilemap.png';
import level from '../assets/levels/test-level.json';
import playerAnimations from '../assets/player/player.json';
import playerSpritesheet from '../assets/player/player.png';

export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }
  preload() {
    //player
    this.load.atlas({
      key: 'player',
      textureUrl: playerSpritesheet,
      atlasUrl: playerAnimations
    });

    //map
    this.load.image('tilemap-rock-grass', rockTilemap);
    this.load.tilemapTiledJSON('map', level);
  }

  makeMap() {}

  create() {
    //create Level
    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage(
      'rock-tilemap',
      'tilemap-rock-grass'
    );
    this.mapLayerGrass = this.map.createDynamicLayer('grass', tiles, 0, 0);
    this.mapLayerGround = this.map.createDynamicLayer('ground', tiles, 0, 0);
    this.mapLayerGround.setCollisionBetween(1, 36);

    //create player
    this.player = this.physics.add.sprite(128, 128, 'player');
    this.player.body.setGravityY(300);
    this.physics.add.collider(this.player, this.mapLayerGround);
    this.cameras.main.startFollow(this.player);
  }
  update() {
    this.cursors = this.input.keyboard.createCursorKeys();
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    }
  }
  render() {}
}
