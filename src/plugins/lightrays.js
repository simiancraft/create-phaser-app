import Phaser from 'phaser/src/phaser.js';
import polygonClipping from 'polygon-clipping';

import tilemapLayerToTileClumps from './clumpy';

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

  polygonFromTile(tile) {
    const {
      pixelX,
      pixelY,
      height,
      width,
      faceBottom,
      faceTop,
      faceRight,
      faceLeft
    } = tile;

    console.log({
      faceTop,
      faceRight,
      faceBottom,
      faceLeft
    });

    let pointList = [];

    if (faceTop) {
    }

    return [
      [pixelX, pixelY],
      [pixelX, pixelY + height],
      [pixelX + width, pixelY + height],
      [pixelX + width, pixelY]
      //  [pixelX, pixelY]
    ];
  }

  specialTiles = null;

  polygonFromTilesets(tile, tilesets) {
    if (!this.specialTiles) {
      this.specialTiles = tilesets
        .map(tileset => tileset.tiles)
        .reduce((acc, tileset) => {
          return { ...acc, ...tileset };
        }, {});
    }
    let specialPoly = this.specialTiles[tile.index - 1];
    if (!specialPoly) {
      return false;
    }
    let ptList =
      specialPoly.objectgroup.objects.reduce((acc, obj) => {
        return (
          (obj &&
            obj.polygon &&
            obj.polygon.map(pt => {
              let _x = Math.round(pt.x + tile.pixelX);
              let _y = Math.round(pt.y + tile.pixelY);
              if (tile.faceLeft) {
                _x = _x + tile.width;
              }
              let XY = [_x, _y];
              return XY;
            })) ||
          acc
        );
      }, null) || [];

    ptList = ptList;
    return ptList;
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
          let thisPolygon =
            this.polygonFromTilesets(_t, tilesets) || this.polygonFromTile(_t);

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
