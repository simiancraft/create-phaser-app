import Phaser from 'phaser/src/phaser.js';

import rockTilemap from '../assets/levels/rock-tilemap.png';
import level from '../assets/levels/test-level.json';
import playerAnimationList from '../assets/player/player-animation-list';
import playerJSON from '../assets/player/player.json';
import playerPNG from '../assets/player/player.png';
import constants from '../config/constants';

const { WIDTH, HEIGHT, SCALE } = constants;

export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }
  preload() {
    //map
    this.load.image('tilemap-rock-grass', rockTilemap);
    this.load.tilemapTiledJSON('map', level);

    //player
    this.load.atlas({
      key: 'player-atlas',
      textureURL: playerPNG,
      atlasURL: playerJSON
    });
  }
  create() {
    //create Level
    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage(
      'rock-tilemap',
      'tilemap-rock-grass'
    );
    this.mapLayerGrass = this.map.createStaticLayer('grass', tiles, 0, 0);
    this.mapLayerGround = this.map.createStaticLayer('ground', tiles, 0, 0);
    this.mapLayerGround.setCollisionBetween(1, 36);

    //create player
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.body.setGravityY(300);
    this.physics.add.collider(this.player, this.mapLayerGround);
    this.cameras.main.startFollow(this.player);
    this.makeAnimations();
    this.player.on('animationcomplete', this.animcomplete, this);
  }

  update() {
    this.cursors = this.input.keyboard.createCursorKeys();
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left-walk', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right-walk', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('left-idle', true);
    }

    if (this.cursors.up.isDown && this.player.body.onFloor()) {
      this.player.setVelocityY(-300);
    }
  }

  animcomplete(animation, frame) {
    //console.log(animation, frame);
  }

  makeAnimation({ name, frames, repeat }) {
    const FRAMERATE = 24;
    return this.anims.create({
      key: `${name}`,
      frames: this.anims.generateFrameNames('player-atlas', {
        start: 0,
        end: frames,
        zeroPad: 3,
        suffix: '.png',
        prefix: `${name}-`
      }),
      frameRate: FRAMERATE,
      repeat: repeat ? -1 : 0
    });
  }

  makeAnimations() {
    playerAnimationList.forEach(animation => {
      const { name, frames, repeat } = animation;
      this.makeAnimation({
        name: name,
        frames: frames,
        repeat: !!repeat
      });
    });
  }

  render() {}
}
