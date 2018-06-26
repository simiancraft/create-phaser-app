import StateMachine from 'fsm-as-promised';

import playerAnimationList from './player-animation-list';
import playerJSON from './player.json';
import playerPNG from './player.png';

export default ({ scene, entity }) => {
  scene.load.atlas({
    key: 'player-atlas',
    textureURL: playerPNG,
    atlasURL: playerJSON
  });

  makeAnimations({ scene, entity, animationList: playerAnimationList });

  var behaviors = StateMachine({
    initial: 'here',
    events: [
      { name: 'wait', from: 'here' },
      { name: 'jump', from: 'here', to: 'there' },
      { name: 'walk', from: ['there', 'somewhere'], to: 'here' }
    ],
    callbacks: {
      onwait: function(options) {
        console.log(options);
        // do something when executing the transition
      },
      onleavehere: function() {
        // do something when leaving state here
      },
      onleave: function() {
        // do something when leaving any state
      },
      onentersomewhere: function() {
        // do something when entering state somewhere
      },
      onenter: function() {
        // do something when entering any state
      },
      onenteredsomewhere: function() {
        // do something after entering state somewhere
        // transition is complete and events can be triggered safely
      },
      onentered: function() {
        // do something after entering any state
        // transition is complete and events can be triggered safely
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
