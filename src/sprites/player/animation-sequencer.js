export default class AnimationSequencer {
  constructor({ scene, entity, animationList }) {
    this.makeAnimations({ scene, entity, animationList });
    this.scene = scene;
    this.entity = entity;
    this.animationList = animationList;
  }

  makeAnimation({ name, frames, repeat, scene, entity }) {
    const FRAMERATE = 24;
    return scene.anims.create({
      key: `${name}`,
      frames: scene.anims.generateFrameNames('player-atlas', {
        start: 0,
        end: frames,
        zeroPad: 0,
        suffix: '.png',
        prefix: `${name}-`
      }),
      frameRate: FRAMERATE,
      repeat: repeat ? -1 : 0
    });
  }

  makeAnimations({ scene, entity, animationList }) {
    animationList.forEach(animation => {
      const { name, frames, repeat } = animation;
      this.makeAnimation({
        name: name,
        entity: entity,
        frames: frames,
        repeat: !!repeat,
        scene: scene
      });
    });
  }

  sequence(name) {
    return new Promise((resolve, reject) => {
      this.entity.anims.play(name, true);
      this.entity.on(
        'animationcomplete',
        (animation, frame) => {
          resolve(name);
        },
        this.entity
      );
    });
  }
}
