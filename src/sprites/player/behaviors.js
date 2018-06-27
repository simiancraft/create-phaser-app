import machina from 'machina';

import AnimationSequencer from './animation-sequencer';
import animationList from './player-animation-list';
import playerJSON from './player.json';
import playerPNG from './player.png';

class Directions extends machina.Fsm {
  constructor({ scene, entity }) {
    const directionalFsm = {
      namespace: 'player-directions1',
      initialState: 'left',
      states: {
        left: {
          _onEnter: function() {
            this.handle('turn', { direction: 'left' });
          }
        },
        right: {
          _onEnter: function() {
            this.handle('turn', { direction: 'right' });
          }
        },
        left2right: {
          _onEnter: function() {
            this.handle('turn', { direction: 'left2right' });
          }
        },
        right2left: {
          _onEnter: function() {
            this.handle('turn', { direction: 'right2left' });
          }
        }
      }
    };
    super(directionalFsm);
    this.scene = scene;
    this.entity = entity;
  }
}

export default class Behaviors extends machina.Fsm {
  constructor({ scene, entity }) {
    const directions = new Directions({ scene, entity });
    const as = new AnimationSequencer({
      scene,
      entity,
      animationList
    });

    const behaviorFsm = {
      namespace: 'player-behaviors1',
      initialState: 'idling',
      states: {
        idling: {
          _child: directions,
          _onEnter: function() {
            entity.setVelocityX(0);
            as.sequence(`${directions.state}-idle`);
          },
          walk: function(data) {
            this.transition('walking');
          },
          crouch: function() {
            this.transition('crouchingDown');
          }
        },
        walking: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-walk`);
          },
          idle: function(data) {
            console.log('idle called in walking', data);
            this.transition('idling');
          },
          walk: function(data) {
            directions.transition(data.direction);
            entity.setVelocityX(data.speed);
            console.log('walk called in walking', data);
          },
          turn: function(data) {
            this.transition('turning');
          },
          crouch: function() {
            entity.setVelocityX(0);
            this.transition('crouchingDown');
          }
        },
        turning: {
          _child: directions,
          _onEnter: function() {
            const { state } = directions;
            const turnDirection =
              state === 'right' ? 'left2right' : 'right2left';
            directions.transition(turnDirection);
            const face = Math.round(Math.random()) ? 'front' : 'back';
            const animation = `${directions.state}-walkturn-${face}`;

            as.sequence(animation).then(() => {
              const dir = turnDirection === 'left2right' ? 'right' : 'left';
              directions.transition(dir);
              this.transition('walking');
            });
          },
          walk: function({ speed }) {
            entity.setVelocityX(speed * 0.25);
          }
        },
        crouchingDown: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-crouch-up2dwn`).then(() => {
              this.transition('crouching');
            });
          }
        },
        crouchingUp: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-crouch-dwn2up`).then(() => {
              this.transition('idling');
            });
          }
        },
        crouching: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-crouch`);
          },
          idle: function() {
            this.transition('crouchingUp');
          },
          walk: function(data) {
            console.log('.');
            if (data.direction !== directions.state) {
              directions.transition(data.direction);
              this.transition('turning');
            }
          },
          uncrouch: function() {
            this.transition('crouchingUp');
          }
        }
      }
    };

    super(behaviorFsm);
    this.scene = scene;
    this.entity = entity;
  }

  static preload(scene) {
    scene.load.atlas({
      key: 'player-atlas',
      textureURL: playerPNG,
      atlasURL: playerJSON
    });
  }
}
