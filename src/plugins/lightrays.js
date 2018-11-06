import Phaser from 'phaser/src/phaser.js';
import polygonClipping from 'polygon-clipping';

import tilemapLayerToTileClumps from './clumpy';
import tileToPolygon from './poly';

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

  drawPolygon(thisPolygon) {
    var polygon = new Phaser.Geom.Polygon(thisPolygon);
    if (!this._polygonGraphics) {
      this._polygonGraphics = this.scene.add.graphics({ x: 0, y: 0 });
    }

    this._polygonGraphics.lineStyle(1, 0x00aa00);
    this._polygonGraphics.beginPath();
    this._polygonGraphics.moveTo(polygon.points[0].x, polygon.points[0].y);
    for (var i = 1; i < polygon.points.length; i++) {
      this._polygonGraphics.lineTo(polygon.points[i].x, polygon.points[i].y);
    }
    this._polygonGraphics.closePath();
    this._polygonGraphics.strokePath();
  }

  createPolygonLayerFromTilemapLayer({ tilemapLayer, level }) {
    let { tileHeight, tileWidth, data } = tilemapLayer.layer;

    let { tilesets } = level;

    let clusters = tilemapLayerToTileClumps(tilemapLayer);

    console.log(clusters);

    let polygonTiles = [];
    let ri, ci, colLength;
    let rowLength = data.length;
    for (ri = 0; ri < rowLength; ri++) {
      colLength = data[ri].length;
      for (ci = 0; ci < colLength; ci++) {
        let _t = data[ri][ci];
        if (_t.index > -1) {
          let thisPolygon = tileToPolygon(_t, tilesets);

          polygonTiles.push({
            tile: _t,
            polygon: thisPolygon
          });
        } else {
        }
      }
    }

    console.log(polygonTiles);

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
