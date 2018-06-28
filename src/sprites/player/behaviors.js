import machina from 'machina';

import AnimationSequencer from './animation-sequencer';
import animationList from './player-animation-list';
import playerJSON from './player.json';
import playerPNG from './player.png';

class Directions extends machina.Fsm {
  constructor({ scene, entity }) {
    const _aDelta = 35;
    const boosterOpts = {
      left: {
        x: 65,
        y: 18,
        angle: 90 - _aDelta
      },
      right: {
        x: 10,
        y: 18,
        angle: 90 + _aDelta
      }
    };

    const directionalFsm = {
      namespace: 'player-directions',
      initialState: 'left',
      states: {
        left: {
          _onEnter: function() {
            this.handle('turn', { direction: 'left' });
            this.emit('booster', boosterOpts.left);
          }
        },
        right: {
          _onEnter: function() {
            this.handle('turn', { direction: 'right' });
            this.emit('booster', boosterOpts.right);
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

class Aims extends machina.Fsm {
  constructor({ scene, entity }) {

    const aimFsm = {
      namespace: 'player-aims',
      initialState: 'none',
      states: {
        none: {
          _onEnter: function() {
            this.handle('changeaim', { direction: 'none' });
          }
        },
        up: {
          _onEnter: function() {
            this.handle('changeaim', { direction: 'up' });
          }
        },
        upfwd: {
          _onEnter: function() {
            this.handle('changeaim', { direction: 'upfwd' });
          }
        },
        fwd: {
          _onEnter: function() {
            this.handle('changeaim', { direction: 'fwd' });
          }
        },
        dwnfwd: {
          _onEnter: function() {
            this.handle('changeaim', { direction: 'dwnfwd' });
          }
        },
        dwn: {
          _onEnter: function() {
            this.handle('changeaim', { direction: 'dwn' });
          }
        }
      }
    };
    super(aimFsm);

    this.scene = scene;
    this.entity = entity;
  }
}

export default class Behaviors extends machina.Fsm {
  constructor({ scene, entity }) {
    const directions = new Directions({ scene, entity });

    const aims = new Aims({ scene, entity });

    const as = new AnimationSequencer({
      scene,
      entity,
      animationList
    });

    const behaviorFsm = {
      namespace: 'player-behaviors',
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
          },
          jump: function(data) {
            this.transition('jumping');
          },
          shootMissiles: 'missilesLaunch',
          boost: function({ velocities }) {
            this.transition('sliding');
          },
          aim: function(data) {
            aims.transition(data.direction);
            if (data.direction !== 'none') {
              this.transition('shooting');
            }
          }
        },
        walking: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-walk`);
          },
          idle: function(data) {
            //console.log('idle called in walking', data);
            this.transition('idling');
          },
          walk: function(data) {
            const { velocities, direction } = data;
            let speed = velocities.walking;
            if (direction === 'left') {
              speed = -speed;
            }
            directions.transition(direction);
            entity.setVelocityX(speed);
            //console.log('walk called in walking', data);
          },
          turn: function() {
            this.transition('turning');
          },
          crouch: function() {
            entity.setVelocityX(0);
            this.transition('crouchingDown');
          },
          jump: function(data) {
            this.transition('jumping');
          },
          unland: function() {
            this.transition('flying');
          },
          shootMissiles: 'missilesLaunch',
          boost: function({ velocities }) {
            this.transition('sliding');
          },
          aim: function(data) {
            aims.transition(data.direction);
            if (data.direction !== 'none') {
              this.transition('walkShooting');
            }
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
          walk: function(data) {
            const { velocities, direction } = data;
            let speed = velocities.turning;
            if (direction === 'left') {
              speed = -speed;
            }
            entity.setVelocityX(speed);
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
            if (data.direction !== directions.state) {
              directions.transition(data.direction);
              this.transition('turning');
            }
          },
          uncrouch: function() {
            this.transition('crouchingUp');
          },
          jump: function(data) {
            this.transition('jumpPrepping');
          }
        },
        jumpPrepping: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-crouchjump`).then(() => {
              this.transition('highJumping');
            });
          },
          jump: function(data) {
            const { velocities, onFloor } = data;
          }
        },
        highJumping: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-aerial`).then(() =>
              this.transition('flying')
            );
          },
          idle: function() {
            this.transition('idling');
          },
          jump: function(data) {
            const { velocities, onFloor } = data;
            if (onFloor) {
              entity.setVelocityY(-velocities.highjump);
            }
          }
        },
        jumping: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-aerial`).then(() =>
              this.transition('flying')
            );
          },
          idle: function() {
            this.transition('idling');
          },
          jump: function(data) {
            const { velocities, onFloor } = data;
            if (onFloor) {
              entity.setVelocityY(-velocities.jump);
            }
          }
        },
        //TODO: make this like a cannonball sort of thing
        launching: {
          _child: directions,
          _onEnter: function() {
            let { launchHalt, launchPowerX, launchPowerY } = entity.velocities;

            if (directions.state === 'left') {
              launchPowerX = -launchPowerX;
              launchHalt = -launchHalt;
            }

            console.log('1');
            entity.setVelocityX(launchHalt);
            this.emit('booster', { on: true });
            as.sequence(`${directions.state}-crouchjump`).then(() => {
              entity.setVelocityX(launchPowerX);
              if (entity.body.onFloor()) {
                this.emit('booster', { on: true });
                entity.setVelocityY(-launchPowerY);
                this.transition('launched');
              } else {
                this.transition('launched');
              }
            });
          }
        },
        launched: {
          _child: directions,
          land: function() {
            this.emit('booster', { on: false });
            this.transition('idling');
          }
        },
        flying: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-aerial`);
          },
          land: function(data) {
            const { velocities, onFloor } = data;
            let speed = velocities.landing;
            let _velX = entity.body.velocity.x;

            if (directions.state === 'left') {
              speed = -speed;
              speed = _velX > speed ? _velX : speed;
            } else {
              speed = _velX < speed ? _velX : speed;
            }

            entity.setVelocityX(speed);
            this.transition('landing');
          },
          veer: function(data) {
            const { velocities, direction } = data;

            let speed = velocities.flying;
            if (direction === 'left') {
              speed = -speed;
            }
            directions.transition(direction);
            entity.setVelocityX(speed);
          },
          turn: function(data) {
            this.transition('flyTurning');
          },
          boost: function(data) {
            entity.setVelocityY(-data.velocities.aerialBoosting);
            this.emit('booster', { on: true });
          },
          unboost: function() {
            this.emit('booster', { on: false });
          }
        },
        flyTurning: {
          _child: directions,
          _onEnter: function() {
            const { state } = directions;
            const turnDirection =
              state === 'right' ? 'left2right' : 'right2left';
            directions.transition(turnDirection);
            const animation = `${directions.state}-aerial`;

            as.sequence(animation).then(() => {
              const dir = turnDirection === 'left2right' ? 'right' : 'left';
              directions.transition(dir);
              this.transition('flying');
            });
          }
        },
        landing: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-crouch-up2dwn`)
              .then(() => as.sequence(`${directions.state}-crouch-dwn2up`))
              .then(() => {
                this.transition('idling');
              });
          }
        },
        missilesLaunch: {
          _onEnter: function() {
            entity.setVelocityX(0);
            as.sequence(`${directions.state}-firemissile`).then(() =>
              this.transition('idling')
            );
          }
        },
        sliding: {
          _onEnter: function() {
            this.emit('booster', { on: true });
            let direction = directions.state;
            let { sliding, slideBursting } = entity.velocities;
            if (direction === 'left') {
              sliding = -sliding;
              slideBursting = -slideBursting;
            }
            entity.setVelocityX(slideBursting);

            as.sequence(`${directions.state}-slide-stand2slide`).then(() => {
              entity.setVelocityX(sliding);
              this.emit('booster', { on: false });
              this.timer = setTimeout(
                function() {
                  this.handle('unboost');
                }.bind(this),
                entity.timings.slideDuration
              );
            });
          },
          unboost: function() {
            entity.setVelocityX(0);
            this.transition('slidend');
          },
          jump: function() {
            this.transition('launching');
          }
        },
        slidend: {
          _onEnter: function() {
            as.sequence(`${directions.state}-slide-slide2stand`).then(() => {
              this.transition('idling');
            });
          }
        },
        shootingAiming: {
          _onEnter: function() {
            console.log('move gun');
          },
          aim: 'shooting',
          idle: 'idling',
          walk: 'walking'
        },
        shooting: {
          _child: aims,
          _onEnter: function() {
            if (aims.state != 'none') {
              as.sequence(`${directions.state}-firecannon-${aims.state}`);
            }
          },
          aim: function({ direction }) {
            aims.transition(direction);
            this.transition('shootingAiming');
          },
          idle: 'idling',
          walk: 'walking',
          turn: function() {
            this.transition('turning');
          }
        },
        walkShootingAiming: {
          aim: 'walkShooting',
          idle: 'idling'
        },
        walkShooting: {
          _child: aims,
          _onEnter: function() {
            if (aims.state != 'none') {
              as.sequence(`${directions.state}-firecannonwalk-${aims.state}`);
            } else {
              this.transition('walking');
            }
          },
          aim: function({ direction }) {
            aims.transition(direction);
            this.transition('walkShootingAiming');
          },
          idle: 'idling',
          walk: function(data) {
            const { velocities, direction } = data;
            let speed = velocities.walking;
            if (direction === 'left') {
              speed = -speed;
            }
            directions.transition(direction);
            entity.setVelocityX(speed);
          },
          turn: function() {
            this.transition('turning');
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
