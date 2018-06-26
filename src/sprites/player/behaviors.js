import StateMachine from 'state-machine';

import animationList from './player-animation-list';
import playerJSON from './player.json';
import playerPNG from './player.png';

export default ({ scene, entity }) => {
  scene.load.atlas({
    key: 'player-atlas',
    textureURL: playerPNG,
    atlasURL: playerJSON
  });

  makeAnimations({ scene, entity, animationList });

  function animcomplete(animation, frame) {
    console.log(animation, frame);
    //auto fire the right 'done' handler here, do the plugging.
  }

  var behaviors = new StateMachine({
    initial: 'left_idle',
    transitions: [
      `walkLeft : 
        left_idle > left_walk | 
        right_idle > right2left_walkturn > left_walk`,

      `walkRight : 
        right_idle > right_walk | 
        left_idle > left2right_walkturn > right_walk`
    ]
  });

  entity.on('animationcomplete', animcomplete, entity);

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
