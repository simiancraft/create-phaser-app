import Phaser from 'phaser/src/phaser.js';

export default class DragonBonesPlugin extends Phaser.Plugins.BasePlugin {
  constructor(scene) {
    super('DragonBonesPlugin', scene);

    console.log('-----------------------');
    this.scene = scene;
    console.log(scene);
  }

  init(name) {
    console.log('DragonBones says hello');
    console.log(this);
  }

  test() {
    console.log('HI EVERYONE');
  }

  entities = [];

  load({ name, skeleton, texture, textureMap }) {
    console.log(this);

    console.log('name', name);
    console.log('skeleton', skeleton);
    console.log('texture', texture);
    console.log('textureMap', textureMap);

    this.scene.load.image(`${name}-texture`, texture);
  }
}
