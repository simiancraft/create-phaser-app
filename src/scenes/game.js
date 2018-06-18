import Phaser from 'phaser/src/phaser.js';

import rockTilemap from '../assets/levels/rock-tilemap.png';
import level from '../assets/levels/test-level.json';
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
    this.player = this.physics.add.sprite(256, 256, 'player');
    this.player.body.setGravityY(300);
    this.physics.add.collider(this.player, this.mapLayerGround);
    this.cameras.main.startFollow(this.player);
    this.makeAnimations();
  }
  update() {
    this.cursors = this.input.keyboard.createCursorKeys();
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('left-idle', true);
    }

    if (this.cursors.up.isDown && this.player.body.onFloor()) {
      this.player.setVelocityY(-200);
    }
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
    const animations = [
      { name: 'left-crouch-dwnup', frames: 5 },
      { name: 'left-crouch-updwn', frames: 5 },
      { name: 'left-crouchjump', frames: 7 },
      { name: 'left-damage', frames: 5 },
      { name: 'left-die', frames: 58 },
      { name: 'left-firecannon-dwn', frames: 6 },
      { name: 'left-firecannon-dwnfwd', frames: 6 },
      { name: 'left-firecannon-fwd', frames: 6 },
      { name: 'left-firecannon-up', frames: 6 },
      { name: 'left-firecannon-upfwd', frames: 6 },
      { name: 'left-firecannonwalk-dwn', frames: 22 },
      { name: 'left-firecannonwalk-dwnfwd', frames: 22 },
      { name: 'left-firecannonwalk-fwd', frames: 22 },
      { name: 'left-firecannonwalk-up', frames: 22 },
      { name: 'left-firecannonwalk-upfwd', frames: 22 },
      { name: 'left-firemissile', frames: 22 },
      { name: 'left-idle', frames: 46 },
      { name: 'left-slide-slide2stand', frames: 3 },
      { name: 'left-slide-stand2slide', frames: 5 },
      { name: 'left-walk', frames: 22 },
      { name: 'left2right-aerial', frames: 5 },
      { name: 'left2right-walkturn-back', frames: 11 },
      { name: 'left2right-walkturn-front', frames: 11 },
      { name: 'right-crouch-dwn2up', frames: 5 },
      { name: 'right-crouch-up2dwn', frames: 5 },
      { name: 'right-crouchjump', frames: 7 },
      { name: 'right-damage', frames: 5 },
      { name: 'right-die', frames: 58 },
      { name: 'right-firecannon-dwn', frames: 6 },
      { name: 'right-firecannon-dwnfwd', frames: 6 },
      { name: 'right-firecannon-fwd', frames: 6 },
      { name: 'right-firecannon-up', frames: 6 },
      { name: 'right-firecannon-upfwd', frames: 6 },
      { name: 'right-firecannonwalk-dwn', frames: 22 },
      { name: 'right-firecannonwalk-dwnfwd', frames: 22 },
      { name: 'right-firecannonwalk-fwd', frames: 22 },
      { name: 'right-firecannonwalk-up', frames: 22 },
      { name: 'right-firecannonwalk-upfwd', frames: 22 },
      { name: 'right-firemissile', frames: 22 },
      { name: 'right-idle', frames: 46 },
      { name: 'right-slide-slide2stand', frames: 3 },
      { name: 'right-slide-stand2slide', frames: 5 },
      { name: 'right-walk', frames: 22 },
      { name: 'right2left-aerial', frames: 5 },
      { name: 'right2left-walkturn-back', frames: 11 },
      { name: 'right2left-walkturn-front', frames: 11 }
    ];
    animations.forEach(animation => {
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
