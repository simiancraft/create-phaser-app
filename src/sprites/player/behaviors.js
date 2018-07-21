import machina from 'machina';

import AnimationSequencer from './animation-sequencer';
import animationList from './player-animation-list';
import playerJSON from './player.json';
import playerPNG from './player.png';

import linearScale from '../../lib/linear-scale';

const shakeForceScale = linearScale([225, 900], [0, 0.03]);
const shakeIntensityScale = linearScale([225, 900], [0, 0.03]);
const shakeDurationScale = linearScale([225, 900], [0, 200]);

class Directions extends machina.Fsm {
  constructor({ scene, entity }) {
    const _aDelta = 35;
    const boosterOpts = {
      left: {
        x: 25,
        y: 10,
        angle: 90 - _aDelta
      },
      right: {
        x: 0,
        y: 10,
        angle: 90 + _aDelta
      }
    };

    const footBoosterOpts = {
      left: {
        x: 25,
        y: 40,
        angle: 0
      },
      right: {
        x: 0,
        y: 40,
        angle: 180
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
            this.emit('footbooster', footBoosterOpts.left);
          }
        },
        right: {
          _onEnter: function() {
            this.handle('turn', { direction: 'right' });
            this.emit('booster', boosterOpts.right);
            this.emit('footbooster', footBoosterOpts.right);
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
      initialState: 'fwd',
      states: {
        up: {
          _onEnter: function() {
            this.handle('changeaim', { aim: 'up' });
          }
        },
        upfwd: {
          _onEnter: function() {
            this.handle('changeaim', { aim: 'upfwd' });
          }
        },
        fwd: {
          _onEnter: function() {
            this.handle('changeaim', { aim: 'fwd' });
          }
        },
        dwnfwd: {
          _onEnter: function() {
            this.handle('changeaim', { aim: 'dwnfwd' });
          }
        },
        dwn: {
          _onEnter: function() {
            this.handle('changeaim', { aim: 'dwn' });
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

    function getvulcanMuzzleSettings() {
      const direction = directions.state;
      const aim = aims.state;

      const settings = {
        left: {
          up: { x: 18, y: -20, angle: -90 },
          upfwd: { x: -6, y: -1, angle: -150 },
          fwd: { x: -15, y: 12, angle: 180 },
          dwnfwd: { x: -6, y: 32, angle: 140 },
          dwn: { x: 19, y: 40, angle: 90 }
        },
        right: {
          up: { x: 18, y: -20, angle: -90 },
          upfwd: { x: 40, y: 0, angle: -30 },
          fwd: { x: 46, y: 12, angle: 0 },
          dwnfwd: { x: 41, y: 33, angle: 40 },
          dwn: { x: 12, y: 40, angle: 90 }
        }
      };

      return settings[direction][aim];
    }

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
          shoot: function(data) {
            //extend to tell WHICH thing is shooting
            this.transition('shooting');
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
          shoot: function(data) {
            this.transition('walkshooting');
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
          },
          shoot: function() {}
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
            as.sequence(`${directions.state}-crouchjumpprep`)
              .then(() => as.sequence(`${directions.state}-crouchjump`))
              .then(() => {
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

            //console.log('1');
            entity.setVelocityX(launchHalt);
            this.emit('booster', { on: true });
            as.sequence(`${directions.state}-crouchjumpprep`)
              .then(() => as.sequence(`${directions.state}-crouchjump`))
              .then(() => {
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
            this.transition('launchlanding');
          }
        },
        flying: {
          _child: directions,
          _onEnter: function() {
            as.sequence(`${directions.state}-aerial`);
          },
          land: function(data) {
            let { velocities, shakes } = entity;
            let speed = velocities.landing;
            let _velX = entity.body.velocity.x;

            if (directions.state === 'left') {
              speed = -speed;
              speed = _velX > speed ? _velX : speed;
            } else {
              speed = _velX < speed ? _velX : speed;
            }

            if (data.fallForce) {
              let shakeForce = shakeForceScale(data.fallForce);
              let shakeIntensity = shakeIntensityScale(data.fallForce);
              let shakeDuration = shakeDurationScale(data.fallForce);
              //console.log(data.fallForce, shakeForce)
              entity.scene.cameras.main.shake(
                shakeDuration,
                shakeIntensity,
                shakeForce
              );
            }

            entity.setVelocityX(speed);
            this.emit('booster', { on: false });
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
        launchlanding: {
          _child: directions,
          _onEnter: function() {
            let { velocities, shakes } = entity;
            let speed = velocities.launchlanding;
            let _velX = entity.body.velocity.x;
            let _velY = entity.body.velocity.y;
            let shakeThreshold = velocities.launchlanding;
            let doShake = false;

            if (directions.state === 'left') {
              speed = -speed;
              doShake = _velX < speed;
              speed = _velX > speed ? _velX : speed;
            } else {
              doShake = _velX > speed;
              speed = _velX < speed ? _velX : speed;
            }
            if (doShake) {
              entity.scene.cameras.main.shake(shakes.launchLand, 0.02, 0.02);
            }
            entity.setVelocityX(speed);
            this.emit('booster', { on: false });
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
            this.emit('footbooster', { on: true });
            let direction = directions.state;
            let { sliding, slideBursting } = entity.velocities;
            if (direction === 'left') {
              sliding = -sliding;
              slideBursting = -slideBursting;
            }
            entity.setVelocityX(slideBursting);
            as.sequence(`${directions.state}-slide-stand2slide`).then(() => {
              entity.setVelocityX(sliding);
              this.emit('footbooster', { on: false });
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
        aiming: {
          _child: directions,
          turn: function() {
            this.transition('shootturning');
          },
          shoot: function() {
            const muzzleSettings = getvulcanMuzzleSettings();
            this.emit('vulcanmuzzle', {
              on: true,
              ...muzzleSettings
            });
            this.transition('shooting');
          },
          idle: 'idling',
          unshoot: function() {
            this.emit('vulcanmuzzle', { on: false });
          }
        },
        shootturning: {
          _child: directions,
          _onEnter: function() {
            this.emit('vulcanmuzzle', { on: false });
            const { state } = directions;
            const turnDirection =
              state === 'right' ? 'left2right' : 'right2left';
            directions.transition(turnDirection);
            const face = Math.round(Math.random()) ? 'front' : 'back';
            const animation = `${directions.state}-walkturn-${face}`;

            as.sequence(animation).then(() => {
              const dir = turnDirection === 'left2right' ? 'right' : 'left';
              directions.transition(dir);
              this.transition('shooting');
            });
          }
        },
        shooting: {
          _child: aims,
          _onEnter: function() {
            this.emit('vulcanmuzzle', {
              on: true,
              ...getvulcanMuzzleSettings()
            });
            as.sequence(`${directions.state}-firecannon-${aims.state}`).then(
              () => {}
            );
          },
          _onExit: function() {
            this.emit('vulcanmuzzle', { on: false });
          },
          aim: function({ aim, direction }) {
            aims.transition(aim);
            if (direction) {
              directions.transition(direction);
            }
          },
          changeaim: function() {
            this.transition('aiming');
          },
          idle: 'idling',
          jump: 'jumping',
          unshoot: function() {
            this.emit('vulcanmuzzle', { on: false });
            this.transition('idling');
          }
        },
        walkaiming: {
          _child: directions,
          turn: function() {
            this.transition('walkshootturning');
          },
          shoot: function() {
            const muzzleSettings = getvulcanMuzzleSettings();
            this.emit('vulcanmuzzle', {
              on: true,
              ...muzzleSettings
            });
            this.transition('walkshooting');
          },
          idle: 'idling'
        },
        walkshootturning: {
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
              this.transition('walkshooting');
            });
          }
        },
        walkshooting: {
          _child: aims,
          _onEnter: function() {
            this.emit('vulcanmuzzle', {
              on: true,
              ...getvulcanMuzzleSettings()
            });
            as.sequence(`${directions.state}-firecannonwalk-${aims.state}`);
          },
          _onExit() {
            this.emit('vulcanmuzzle', { on: false });
          },
          aim: function({ aim, direction, velocities }) {
            aims.transition(aim);
            if (direction) {
              directions.transition(direction);
              let speed = velocities.walking;
              if (direction === 'left') {
                speed = -speed;
              }
              directions.transition(direction);
              entity.setVelocityX(speed);
            }
          },
          changeaim: function() {
            this.transition('walkaiming');
          },
          idle: 'idling',
          jump: 'jumping',
          unshoot: 'walking'
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
