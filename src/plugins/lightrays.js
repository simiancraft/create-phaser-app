import Phaser from 'phaser/src/phaser.js';

export default class LightraysPlugin extends Phaser.Plugins.BasePlugin {
  constructor(scene) {
    super('LightraysPlugin', scene);

    console.log('-----------------------');
    this.scene = scene;
    console.log(scene);
  }

  init(name) {
    console.log('Lightrays says hello');
    console.log(this);
  }

  test() {
    console.log('HI EVERYONE');
  }

  entities = [];

  load({ name }) {
    console.log(this);
  }

  createPolygonsFromTilemapLayer(data) {
    const { tilemapLayer } = data;

    console.log(data);
  }
}
