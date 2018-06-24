import Phaser from 'phaser';

import playerAnimationList from './player-animation-list';
import playerJSON from './player.json';
import playerPNG from './player.png';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor({ scene, x, y }) {
    super(scene, x, y, 'player');
    this.direction = 'left';
    this.movementState = 'idle';
    this.scene = scene;
  }

  speeds = {
    walking: 110,
    flying: 160,
    highjump: 600,
    jump: 250
  };

  preload() {
    //player
    this.scene.load.atlas({
      key: 'player-atlas',
      textureURL: playerPNG,
      atlasURL: playerJSON
    });
  }

  create() {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.body.setSize(75, 95);
    this.setOrigin(0.5, 0.6);

    this.body.setGravityY(300);

    this.makeAnimations();
    this.on('animationcomplete', this.animcomplete, this);
  }

  update() {
    console.log('Player');
    const { scene } = this;
    const { direction, movementState } = this;
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    const onFloor = this.body.onFloor();

    if (this.cursors.left.isDown && onFloor && !this.cursors.space.isDown) {
      if (direction === 'left') {
        this.direction = 'left';
        this.movementState = 'walk';
        this.setVelocityX(-this.speeds.walking);
      } else if (direction === 'right') {
        this.direction = 'right2left';
        this.setOrigin(0.55, 0.6);
        const way = Math.round(Math.random()) ? 'front' : 'back';
        this.movementState = `walkturn-${way}`;
        this.setVelocityX(0);
      }
    } else if (
      this.cursors.right.isDown &&
      onFloor &&
      !this.cursors.space.isDown
    ) {
      if (direction === 'right') {
        this.direction = 'right';
        this.movementState = 'walk';
        this.setVelocityX(this.speeds.walking);
      } else if (direction === 'left') {
        this.direction = 'left2right';
        const way = Math.round(Math.random()) ? 'front' : 'back';
        this.movementState = `walkturn-${way}`;
        this.setVelocityX(0);
      }
    } else if (this.cursors.left.isDown && !onFloor) {
      if (direction === 'left') {
      } else if (direction === 'right') {
        this.direction = `right2left`;
      }

      this.setVelocityX(-this.speeds.flying);
    } else if (this.cursors.right.isDown && !onFloor) {
      if (direction === 'right') {
      } else if (direction === 'left') {
        this.direction = `left2right`;
      }

      this.setVelocityX(this.speeds.flying);
    } else if (
      this.cursors.down.isDown &&
      onFloor &&
      !this.cursors.space.isDown
    ) {
      if (movementState.indexOf('crouch') === -1) {
        this.movementState = 'crouch-up2dwn';
        this.setVelocityX(0);
      }
    } else if (
      !this.cursors.down.isDown &&
      onFloor &&
      this.movementState.indexOf('crouch') > -1
    ) {
      this.movementState = 'crouch-dwn2up';
    } else if (this.cursors.space.isDown && onFloor) {
      if (this.movementState.indexOf('crouch') > -1) {
        this.movementState = 'crouchjump';
        this.setVelocityY(-this.speeds.highjump);
      } else {
        this.movementState = 'aerial';
        this.setVelocityY(-this.speeds.jump);
      }
    } else if (onFloor) {
      this.setVelocityX(0);
      this.movementState = 'idle';
    } else {
      this.movementState = 'aerial';
    }

    console.log(this);

    //this.experimentalPopup();
    this.setaAnimation();
  }

  makeAnimation({ name, frames, repeat }) {
    const { scene } = this;
    const FRAMERATE = 24;
    return scene.anims.create({
      key: `${name}`,
      frames: scene.anims.generateFrameNames('player-atlas', {
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

  setaAnimation() {
    const { direction, movementState, frame } = this;
    this.anims.play(`${direction}-${movementState}`, true);
  }

  animcomplete(animation, frame) {
    const { key } = animation;

    function was(name) {
      return key.indexOf(name) > -1;
    }

    if (was('right2left-aerial')) {
      this.direction = 'left';
    }

    if (was('left2right-aerial')) {
      this.direction = 'right';
    }

    if (was('right2left-walkturn')) {
      this.direction = 'left';
      this.movementState = 'walk';
    }

    if (was('left2right-walkturn')) {
      this.direction = 'right';
      this.movementState = 'walk';
    }

    if (was('crouch-up2dwn')) {
      this.movementState = 'crouch';
    }

    if (was('crouch-dwn2up')) {
      this.movementState = 'idle';
    }

    if (was('crouchjump')) {
      this.movementState = 'aerial';
    }
  }
}
