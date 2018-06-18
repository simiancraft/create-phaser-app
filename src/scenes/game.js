import Phaser from 'phaser/src/phaser.js';

import backgroundGradient from '../assets/backgrounds/game/back-gradient.png';
import cloud1 from '../assets/backgrounds/game/cloud-1.png';
import cloud2 from '../assets/backgrounds/game/cloud-2.png';
import ground from '../assets/backgrounds/game/ground.png';
import moon from '../assets/backgrounds/game/moon.png';
import sea from '../assets/backgrounds/game/sea.png';
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
    this.preloadBackground();
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
    this.createBackground(SCALE);
    //create Level
    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage(
      'rock-tilemap',
      'tilemap-rock-grass'
    );
    this.mapLayerGrass = this.map.createStaticLayer('grass', tiles, 0, 0);
    this.mapLayerGround = this.map.createDynamicLayer('ground', tiles, 0, 0);
    this.mapLayerGround.setCollisionBetween(1, 50);

    //create player
    this.player = this.physics.add.sprite(200, 500, 'player');

    this.player.body.setSize(this.player.width, 128);

    this.player.body.setGravityY(300);
    this.player.setBounce(0.2);

    this.physics.add.collider(this.player, this.mapLayerGround);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.cameras.main.setBackgroundColor('#333399');
    this.makeAnimations();
    this.player.on('animationcomplete', this.animcomplete, this);
    this.player.direction = 'left';
    this.debugGraphics = this.add.graphics();
    //this.drawDebug();
  }

  update() {
    this.cursors = this.input.keyboard.createCursorKeys();

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left-walk', true);
      this.player.direction = 'left';
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right-walk', true);
      this.player.direction = 'right';
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play(`${this.player.direction}-idle`, true);
    }

    if (this.cursors.space.isDown && this.player.body.onFloor()) {
      this.player.setVelocityY(-350);
      this.player.anims.play(`${this.player.direction}-crouchjump`, true);
    }
  }

  animcomplete(animation, frame) {
    //console.log(animation, frame);

    if (animation === 'left-crouchjump') {
    }
  }

  preloadBackground() {
    this.load.image('back-gradient', backgroundGradient);
    this.load.image('moon', moon);
    this.load.image('sea', sea);
  }

  createBackground(scale) {
    const center = {
      width: WIDTH * 0.5,
      height: HEIGHT * 0.5
    };
    this.backGradient = this.add
      .image(center.width, center.height, 'back-gradient')
      .setScale(scale)
      .setScrollFactor(0, 0);

    this.add
      .image(center.width, center.height * 1.1, 'sea')
      .setScale(scale)
      .setScrollFactor(0, 0.05);

    this.add
      .image(center.width * 1.6, center.height * 0.4, 'moon')
      .setScale(scale);
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

  drawDebug() {
    let showDebug = true;
    this.debugGraphics.clear();

    if (showDebug) {
      // Pass in null for any of the style options to disable drawing that component
      this.map.renderDebug(this.debugGraphics, {
        tileColor: null, // Non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128), // Colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
      });
    }
  }

  render() {
    this.debug.cameraInfo(this.camera, 32, 32);
    this.debug.spriteCoords(this.player, 32, 500);
  }
}
