import machina from 'machina';

import animationList from './player-animation-list';
import playerJSON from './player.json';
import playerPNG from './player.png';

//prototype this
function sequencer({ scene, entity, animationList }) {
  makeAnimations({ scene, entity, animationList });
  return name => {
    return new Promise((resolve, reject) => {
      entity.anims.play(name, true);
      entity.on(
        'animationcomplete',
        (animation, frame) => {
          resolve(name);
        },
        entity
      );
    });
  };
}

function makeAnimation({ name, frames, repeat, scene, entity }) {
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

function makeAnimations({ scene, entity, animationList }) {
  animationList.forEach(animation => {
    const { name, frames, repeat } = animation;
    makeAnimation({
      name: name,
      entity: entity,
      frames: frames,
      repeat: !!repeat,
      scene: scene
    });
  });
}

class Directions extends machina.Fsm {
  constructor({ scene, entity }) {
    super({
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
    });
    this.scene = scene;
    this.entity = entity;
  }
}

export class PlayerBehaviors extends machina.Fsm {
  constructor({ scene, entity }) {
    const directions = new Directions({ scene, entity });
    const sequence = sequencer({ scene, entity, animationList });
    super({
      namespace: 'player-behaviors1',
      initialState: 'idling',
      states: {
        idling: {
          _child: directions,
          _onEnter: function() {
            entity.setVelocityX(0);
            sequence(`${directions.state}-idle`);
          },
          walk: function(data) {
            this.transition('walking');
          }
        },
        walking: {
          _child: directions,
          _onEnter: function() {
            sequence(`${directions.state}-walk`);
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

            sequence(animation).then(() => {
              const dir = turnDirection === 'left2right' ? 'right' : 'left';
              directions.transition(dir);
              this.transition('walking');
            });
          },
          walk: function({ speed }) {
            entity.setVelocityX(speed * 0.25);
          }
        }
      }
    });

    this.scene = scene;
    this.entity = entity;
  }

  static preload(scene) {
    console.log('scene', scene);
    scene.load.atlas({
      key: 'player-atlas',
      textureURL: playerPNG,
      atlasURL: playerJSON
    });
  }
}
