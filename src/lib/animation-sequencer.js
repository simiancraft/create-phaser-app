export default class AnimationSequencer {
  constructor({ scene, entity, animationList, atlasName, options }) {
    this.animations = this.makeAnimations({
      scene,
      entity,
      animationList,
      atlasName,
      options
    });
    this.scene = scene;
    this.entity = entity;
    this.atlasName = atlasName;
    this.animationList = animationList;
  }

  makeOptions = ({ name, frames, repeat, scene, entity, options }) => {
    let optionOverrides = {};

    if (options && typeof options === 'function') {
      optionOverrides = options({
        name,
        frames,
        repeat,
        scene,
        entity
      });
    }

    //console.log(optionOverrides);

    return {
      ...{
        start: 0,
        end: frames,
        zeroPad: 0,
        suffix: '.png',
        prefix: `${name}-`
      },
      ...optionOverrides
    };
  };

  makeAnimation = ({
    name,
    frames,
    repeat,
    scene,
    entity,
    atlasName,
    options
  }) => {
    const FRAMERATE = 24;
    const _options = this.makeOptions({
      name,
      frames,
      repeat,
      scene,
      entity,
      options
    });

    let frameNames = scene.anims.generateFrameNames(atlasName, _options);

    //console.log(frameNames, scene.anims);

    let _anims = scene.anims.create({
      key: `${name}`,
      frames: frameNames,
      frameRate: FRAMERATE,
      repeat: repeat ? -1 : 0
    });

    //console.log(_anims);

    if (_anims.frames.length === 0) {
      console.log('no frames found with', _options);
    }

    return _anims;
  };

  makeAnimations = ({ scene, entity, animationList, atlasName, options }) => {
    let animations = [];

    animationList.forEach(animation => {
      const { name, frames, repeat } = animation;

      let anim = this.makeAnimation({
        name: name,
        entity: entity,
        frames: frames,
        repeat: !!repeat,
        scene: scene,
        atlasName,
        options
      });

      animations.push(anim);
    });

    return animations;
  };

  sequence(name) {
    return new Promise((resolve, reject) => {
      // console.log(name);
      // console.log('this', this);
      // console.log('this.scene', this.scene);
      // console.log('this.entity', this.entity);

      window.ttt = this.entity;

      this.entity.anims.play(name, true);

      this.entity.once(
        'animationcomplete',
        (animation, frame) => {
          resolve(name);
        },
        this.entity
      );
    });
  }
}
