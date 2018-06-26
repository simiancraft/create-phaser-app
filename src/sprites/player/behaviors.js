import machina from 'machina';

import animationList from './player-animation-list';
import playerJSON from './player.json';
import playerPNG from './player.png';

//prototype this
function sequencer({ scene, entity, animationList }) {
  makeAnimations({ scene, entity, animationList });
  return () => {
    return new Promise((resolve, reject) => {
      resolve('data');
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

  let __store = {
    direction: 'left',
    onFloor: true
  };

  const store = newValues => {
    newValues = newValues || {};
    __store = { ...__store, ...newValues };
    return __store;
  };

  const behaviors = new machina.Fsm({
    namespace: 'player-behaviors',
    initialState: 'uninitialized',
    states: {
      uninitialized: {
        '*': function(client) {
          this.deferUntilTransition();
          this.transition('idling');
        }
      },
      idling: {
        _onEnter: function(data) {
          console.log(data);
          console.log('entered Idling');
        }
      },
      walking: {
        _onEnter: function(data) {
          console.log(data);
          console.log('entered walking');
        },
        idle: function() {
          console.log('idle in walk now');
        }
      }
    },
    __store: {
      direction: 'left',
      onFloor: true
    },
    store: function() {},
    walk: function(data) {
      this.transition('walking');
    },
    idle: function() {
      this.transition('idling');
    },
    jump: function() {}
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
