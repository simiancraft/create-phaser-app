import Phaser from 'phaser/src/phaser.js';
import PolyBool from 'polybooljs';

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

  drawPolygon(thisPolygon, lineStyle) {
    var polygon = new Phaser.Geom.Polygon(thisPolygon);
    if (!this._polygonGraphics) {
      this._polygonGraphics = this.scene.add.graphics({ x: 0, y: 0 });
    }

    this._polygonGraphics.lineStyle(1, lineStyle || 0x00aa00);
    this._polygonGraphics.beginPath();
    this._polygonGraphics.moveTo(polygon.points[0].x, polygon.points[0].y);
    for (var i = 1; i < polygon.points.length; i++) {
      this._polygonGraphics.lineTo(polygon.points[i].x, polygon.points[i].y);
    }
    this._polygonGraphics.closePath();
    this._polygonGraphics.strokePath();
  }

  clusterToRegions(r) {
    return {
      regions: [r],
      inverted: false
    };
  }

  regionsToCombinedRegion(acc, next) {
    return acc ? PolyBool.union(acc, next) : next;
  }

  regionsToFlatPolys(r) {
    return r.regions.flat();
  }

  polygonClusterToCombinedRegion = cluster => {
    return cluster
      .map(this.clusterToRegions)
      .reduce(this.regionsToCombinedRegion);
  };

  clustersToPolygonClusters = tilesets => cluster => {
    function tileToPolygonTile(tile) {
      return tileToPolygon(tile, tilesets);
    }
    return cluster.slice(0, 220).map(tileToPolygonTile);
  };

  createPolygonLayerFromTilemapLayer({ tilemapLayer, level }) {
    let { tileHeight, tileWidth, data } = tilemapLayer.layer;

    let { tilesets } = level;

    let clusters = tilemapLayerToTileClumps(tilemapLayer);

    this.occlusionPolygons = clusters
      .map(this.clustersToPolygonClusters(tilesets))
      .map(this.polygonClusterToCombinedRegion)
      .map(this.regionsToFlatPolys);

    this.occlusionPolygons.forEach(pcluster => {
      this.drawPolygon(pcluster);
    });

    console.log(this.occlusionPolygons);

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

  drawRay(x, y) {
    var line = new Phaser.Geom.Line(
      this._lightsource.x,
      this._lightsource.y,
      x,
      y
    );

    this.lineGraphics.strokeLineShape(line);
  }

  castRays() {
    if (!this.occlusionPolygons || !this._lightsource) {
      return;
    }

    if (!this.lineGraphics) {
      this.lineGraphics = this.scene.add.graphics({
        lineStyle: { width: 1, color: 0xaa00aa }
      });
    }

    this.lineGraphics.clear();
    this.occlusionPolygons.forEach(polygon => {
      polygon.forEach(cord => {
        this.drawRay(cord[0], cord[1]);
      });
    });

    //console.log(this._lightsource);
  }

  lightFollowMouse() {
    this.castRays();
    this.createcircle();
  }
}
