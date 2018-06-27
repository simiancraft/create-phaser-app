import Phaser from 'phaser';

import Behaviors from './behaviors';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor({ scene, x, y }) {
    super(scene, x, y, 'player');
    this.direction = 'left';
    this.movementState = 'idle';
    this.scene = scene;
  }

  speeds = {
    walking: 110,
    turning: 30,
    flying: 160,
    highjump: 600,
    jump: 250
  };

  preload() {
    Behaviors.preload(this.scene);
  }

  create() {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.body.setSize(75, 95);
    this.setOrigin(0.5, 0.61);

    this.body.setGravityY(300);

    this.behaviors = new Behaviors({
      scene: this.scene,
      entity: this
    });

    window.behaviors = this.behaviors;
  }

  hasNoInput() {
    const { down, left, right, up, shift, space } = this.locomotion;
    const { W, A, S, D, Q, E } = this.cockpit;

    return (
      !W.isDown &&
      !A.isDown &&
      !S.isDown &&
      !D.isDown &&
      !down.isDown &&
      !left.isDown &&
      !right.isDown &&
      !up.isDown &&
      !space.isDown &&
      !shift.isDown
    );
  }

  update() {
    const { scene, behaviors, speeds } = this;

    this.locomotion = scene.input.keyboard.createCursorKeys();
    this.cockpit = scene.input.keyboard.addKeys('W,A,S,D,Q,E');

    window.scene = this.scene;
    window.cockpit = this.cockpit;
    window.cursors = this.cursors;
    const { down, left, right, up, shift, space } = this.locomotion;
    const { W, A, S, D, Q, E } = this.cockpit;

    const onFloor = this.body.onFloor();
    const noInput = this.hasNoInput();

    if (onFloor) {
      if (A.isDown) {
        behaviors.handle('walk', {
          direction: 'left',
          onFloor,
          speeds: speeds
        });
      } else if (D.isDown) {
        behaviors.handle('walk', {
          direction: 'right',
          onFloor,
          speeds: speeds
        });
      }

      if (S.isDown) {
        behaviors.handle('crouch', { onFloor });
      } else if (!S.isDown) {
        behaviors.handle('uncrouch', { onFloor });
      } else if (space.isDown) {
        behaviors.handle('jump', { onFloor, speeds });
      }

      if (noInput) {
        behaviors.handle('idle', { onFloor });
      }
    }
  }
}
