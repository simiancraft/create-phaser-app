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

  createPolygonLayerFromTilemapLayer({ tilemapLayer, level }) {
    let { tileHeight, tileWidth, data } = tilemapLayer.layer;
    var graphics = this.scene.add.graphics({ x: 0, y: 0 });
    graphics.lineStyle(2, 0x00aa00);

    let polyList = [];
    let ri, ci, colLength;
    let rowLength = data.length;
    for (ri = 0; ri < rowLength; ri++) {
      colLength = data[ri].length;
      for (ci = 0; ci < colLength; ci++) {
        let _t = data[ri][ci];

        if (_t.index > -1) {
          console.log(_t);

          var polygon = new Phaser.Geom.Polygon([
            _t.pixelX,
            _t.pixelY,
            _t.pixelX,
            _t.pixelY + _t.height,
            _t.pixelX + _t.width,
            _t.pixelY + _t.height,
            _t.pixelX + _t.width,
            _t.pixelY
          ]);

          graphics.beginPath();

          graphics.moveTo(polygon.points[0].x, polygon.points[0].y);

          for (var i = 1; i < polygon.points.length; i++) {
            graphics.lineTo(polygon.points[i].x, polygon.points[i].y);
          }

          graphics.closePath();
          graphics.strokePath();
        }
      }
    }

    this.createcircle();
  }

  createcircle() {
    this._lightsource =
      this._lightsource || new Phaser.Geom.Circle(200, 300, 4);

    this._lightCircleGraphics =
      this._lightCircleGraphics ||
      this.scene.add.graphics({
        lineStyle: { color: 0xff0000 }
      });

    const game = this.scene.game;

    //  only move when you click
    const { worldX, worldY } = game.input.mousePointer;
    this._lightsource.setPosition(worldX, worldY);
    if (game.input.mousePointer.isDown) {
      this._lightCircleGraphics.clear();
      this._lightCircleGraphics.strokeCircleShape(this._lightsource);
    }
  }

  lightFollowMouse() {
    this.createcircle();
  }
}
