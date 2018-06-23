import Phaser from 'phaser';

import backgroundGradient from '../assets/backgrounds/game/back-gradient.png';
import moon from '../assets/backgrounds/game/moon.png';
import sea from '../assets/backgrounds/game/sea.png';
import rockTilemap from '../assets/levels/raw/rock-tilemap.png';
import level from '../assets/levels/raw/test-level.json';
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
    this.player = this.physics.add.sprite(200, 400, 'player');

    this.player.body.setSize(75, 95);
    this.player.setOrigin(0.5, 0.6);

    this.player.body.setGravityY(300);
    this.player.setBounce(0);

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
    this.player.movementState = 'idle';
    this.debugGraphics = this.add.graphics();
    this.drawDebug();
    //window.player = this.player;
  }

  speeds = {
    walking: 110,
    flying: 160,
    highjump: 600,
    jump: 250
  };

  update() {
    const { direction, movementState } = this.player;
    this.cursors = this.input.keyboard.createCursorKeys();

    const onFloor = this.player.body.onFloor();

    if (this.cursors.left.isDown && onFloor && !this.cursors.space.isDown) {
      if (direction === 'left') {
        this.player.direction = 'left';
        this.player.movementState = 'walk';
        this.player.setVelocityX(-this.speeds.walking);
      } else if (direction === 'right') {
        this.player.direction = 'right2left';
        this.player.setOrigin(0.55, 0.6);
        const way = Math.round(Math.random()) ? 'front' : 'back';
        this.player.movementState = `walkturn-${way}`;
        this.player.setVelocityX(0);
      }
    } else if (
      this.cursors.right.isDown &&
      onFloor &&
      !this.cursors.space.isDown
    ) {
      if (direction === 'right') {
        this.player.direction = 'right';
        this.player.movementState = 'walk';
        this.player.setVelocityX(this.speeds.walking);
      } else if (direction === 'left') {
        this.player.direction = 'left2right';
        const way = Math.round(Math.random()) ? 'front' : 'back';
        this.player.movementState = `walkturn-${way}`;
        this.player.setVelocityX(0);
      }
    } else if (this.cursors.left.isDown && !onFloor) {
      if (direction === 'left') {
      } else if (direction === 'right') {
        this.player.direction = `right2left`;
      }

      this.player.setVelocityX(-this.speeds.flying);
    } else if (this.cursors.right.isDown && !onFloor) {
      if (direction === 'right') {
      } else if (direction === 'left') {
        this.player.direction = `left2right`;
      }

      this.player.setVelocityX(this.speeds.flying);
    } else if (
      this.cursors.down.isDown &&
      onFloor &&
      !this.cursors.space.isDown
    ) {
      if (movementState.indexOf('crouch') === -1) {
        this.player.movementState = 'crouch-up2dwn';
        this.player.setVelocityX(0);
      }
    } else if (
      !this.cursors.down.isDown &&
      onFloor &&
      this.player.movementState.indexOf('crouch') > -1
    ) {
      this.player.movementState = 'crouch-dwn2up';
    } else if (this.cursors.space.isDown && onFloor) {
      if (this.player.movementState.indexOf('crouch') > -1) {
        this.player.movementState = 'crouchjump';
        this.player.setVelocityY(-this.speeds.highjump);
      } else {
        this.player.movementState = 'aerial';
        this.player.setVelocityY(-this.speeds.jump);
      }
    } else if (onFloor) {
      this.player.setVelocityX(0);
      this.player.movementState = 'idle';
    } else {
      this.player.movementState = 'aerial';
    }

    this.setaAnimation();
  }

  animcomplete(animation, frame) {
    const { key } = animation;

    function was(name) {
      return key.indexOf(name) > -1;
    }

    if (was('right2left-aerial')) {
      this.player.direction = 'left';
    }

    if (was('left2right-aerial')) {
      this.player.direction = 'right';
    }

    if (was('right2left-walkturn')) {
      this.player.direction = 'left';
      this.player.movementState = 'walk';
    }

    if (was('left2right-walkturn')) {
      this.player.direction = 'right';
      this.player.movementState = 'walk';
    }

    if (was('crouch-up2dwn')) {
      this.player.movementState = 'crouch';
    }

    if (was('crouch-dwn2up')) {
      this.player.movementState = 'idle';
    }

    if (was('crouchjump')) {
      this.player.movementState = 'aerial';
    }
  }

  setaAnimation() {
    const { direction, movementState, frame } = this.player;
    this.player.anims.play(`${direction}-${movementState}`, true);
    //console.log(this.player.frame);

    //this.player.body.setSize(frame.width, frame.height);
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
      .image(center.width, center.height * 1.4, 'sea')
      .setScale(scale)
      .setScrollFactor(0, 0.1);

    this.add
      .image(center.width * 1.6, center.height * 0.4, 'moon')
      .setScale(scale)
      .setScrollFactor(0, 0);
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
    this.map.renderDebug(this.debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    });
  }

  render() {
    this.debug.cameraInfo(this.camera, 32, 32);
    this.debug.spriteCoords(this.player, 32, 500);
  }
}
