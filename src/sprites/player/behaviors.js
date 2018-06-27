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
      if (!repeat) {
        entity.anims.play(animation, true);
      }

      resolve(data);
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
          console.log('=> left');
        }
      },
      right: {
        _onEnter: function() {
          console.log('=>  right');
        }
      },
      right2left: {
        _onEnter: function() {
          console.log('=>  right2left');
        }
      },
      left2right: {
        _onEnter: function() {
          console.log('=>  left2right');
        }
      },
      walk: function(data) {
        console.log('walking in the child', data);
      }
    }
  });

  const aim = new machina.Fsm({
    namespace: 'player-aim',
    initialState: 'fwd',
    states: {
      up: {
        _onEnter: function() {
          console.log('↑↑↑');
        }
      },
      upfwd: {
        _onEnter: function() {
          console.log('↗↗↗');
        }
      },
      fwd: {
        _onEnter: function() {
          console.log('→→→');
        }
      },
      dwnfwd: {
        _onEnter: function() {
          console.log('↘↘↘');
        }
      },
      dwn: {
        _onEnter: function() {
          console.log('↓↓↓');
        }
      }
    }
  });

  const behaviors = new machina.Fsm({
    namespace: 'player-behaviors',
    initialState: 'idling',
    states: {
      idling: {
        _child: directions,
        _onEnter: function(data) {
          let _state = this.compositeState();
          console.log('idling', _state);
          if (_state === 'idling.left') {
            sequence({
              animation: 'left-idle'
            });
          } else if (_state === 'idling.right') {
            sequence({
              animation: 'right-idle'
            });
          }
        }
      },
      walking: {
        _child: directions,
        _onEnter: function(data) {
          let _state = this.compositeState();
          console.log(_state);

          if (_state === 'walking.left') {
            sequence({
              animation: 'left-walk'
            });
          } else if (_state === 'walking.right') {
            sequence({
              animation: 'right-walk'
            });
          }
        }
      },
      flying: {
        _child: directions,
        _onEnter: function(data) {
          console.log('flying');
        }
      },
      jumping: {
        _child: directions,
        _onEnter: function(data) {
          console.log('jumping');
        }
      },
      landing: {
        _child: directions,
        _onEnter: function(data) {
          console.log('jumping');
        }
      },
      shooting: {
        _child: aim,
        _onEnter: function(data) {
          console.log('jumping');
        }
      },
      walkshooting: {
        _child: aim,
        _onEnter: function(data) {
          console.log('jumping');
        }
      }
    },
    store: function() {},
    walk: function(data) {
      const { direction, onFloor } = data;
      if (direction === 'left') {
        directions.transition('left');
      } else {
        directions.transition('right');
      }
      this.transition('walking');
    },
    idle: function() {
      this.transition('idling');
    },
    jump: function() {}
  });

  // behaviors.on('*', function(eventName, data) {
  //   console.log(`-root-${eventName}`);
  //   console.table(data);
  //   console.log(`-root-`);
  // });

  // directions.on('*', function(eventName, data) {
  //   console.log(`-directions-${eventName}`);
  //   console.table(data);
  //   console.log(`-directions-`);
  // });

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
