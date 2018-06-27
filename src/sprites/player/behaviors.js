import machina from 'machina';

import animationList from './player-animation-list';
import playerJSON from './player.json';
import playerPNG from './player.png';

//prototype this
function sequencer({ scene, entity, animationList }) {
  makeAnimations({ scene, entity, animationList });
  return data => {
    const { repeat, animation } = data;

    return new Promise((resolve, reject) => {
      entity.anims.play(animation, true);
      entity.on(
        'animationcomplete',
        (animation, frame) => {
          resolve(data);
        },
        entity
      );
    });
  };
}

export default ({ scene, entity }) => {
  scene.load.atlas({
    key: 'player-atlas',
    textureURL: playerPNG,
    atlasURL: playerJSON
  });

  //possibly add to the seuqncer?

  const sequence = sequencer({ scene, entity, animationList });

  // function animcomplete(animation, frame) {
  //   console.log(animation, frame);
  //   //auto fire the right 'done' handler here, do the plugging.
  // }
  // entity.on('animationcomplete', animcomplete, entity);

  const directions = new machina.Fsm({
    namespace: 'player-directions',
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

  window.directions = directions;

  const behaviors = new machina.Fsm({
    namespace: 'player-behaviors',
    initialState: 'idling',
    states: {
      idling: {
        _child: directions,
        _onEnter: function() {
          sequence({
            animation: `${directions.state}-idle`
          });
        },
        walk: function(data) {
          this.transition('walking');
        }
      },
      walking: {
        _child: directions,
        _onEnter: function() {
          sequence({
            animation: `${directions.state}-walk`
          });
        },
        idle: function(data) {
          console.log('idle called in walking', data);
          this.transition('idling');
        },
        walk: function(data) {
          directions.transition(data.direction);
          console.log('walk called in walking', data);
        },
        turn: function(data) {
          this.transition('turning');
        }
      },
      turning: {
        _child: directions,
        _onEnter: function() {
          if (directions.state === 'right') {
            directions.transition('left2right');
          } else {
            directions.transition('right2left');
          }
          let ctx = this;
          sequence({
            animation: `${directions.state}-walkturn-back`
          }).then(function() {
            if (directions.state === 'left2right') {
              directions.transition('right');
            } else {
              directions.transition('left');
            }
            ctx.transition('walking');
          });
        }
      }
    }
  });

  return behaviors;
};

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

export function preloadBehaviors(scene) {
  scene.load.atlas({
    key: 'player-atlas',
    textureURL: playerPNG,
    atlasURL: playerJSON
  });
}
