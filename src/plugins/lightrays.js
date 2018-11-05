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

  createPolygonLayerFromTilemapLayer({ tilemapLayer, scene }) {
    let { tileHeight, tileWidth, data } = tilemapLayer.layer;

    console.log(data);

    var polygon = new Phaser.Geom.Polygon([
      0,
      143,
      0,
      92,
      110,
      40,
      244,
      4,
      330,
      0,
      458,
      12,
      574,
      18,
      600,
      79,
      594,
      153,
      332,
      152,
      107,
      157
    ]);

    var graphics = scene.add.graphics({ x: 100, y: 200 });

    graphics.lineStyle(2, 0x00aa00);

    graphics.beginPath();

    graphics.moveTo(polygon.points[0].x, polygon.points[0].y);

    for (var i = 1; i < polygon.points.length; i++) {
      graphics.lineTo(polygon.points[i].x, polygon.points[i].y);
    }

    graphics.closePath();
    graphics.strokePath();
  }
}
