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

  occlusionPolygonToOcclusionSegments(occlusionPolygon) {
    let polygonSegments = [];
    let polygonPointsLength = occlusionPolygon.length;

    for (let pti = 0; pti < polygonPointsLength; pti++) {
      let currentPoint = occlusionPolygon[pti];
      let nextPoint = occlusionPolygon[pti + 1];
      //console.log(currentPoint, nextPoint);
      if (nextPoint) {
        let segment = {
          a: { x: currentPoint[0], y: currentPoint[1] },
          b: { x: nextPoint[0], y: nextPoint[1] }
        };

        //console.log(segment);
        polygonSegments.push(segment);
      }
    }
    return polygonSegments;
  }

  //kind of voodoo here.
  getRaySegmentIntersection(ray, segment) {
    let r_px = ray.a.x;
    let r_py = ray.a.y;
    let r_dx = ray.b.x - ray.a.x;
    let r_dy = ray.b.y - ray.a.y;
    let s_px = segment.a.x;
    let s_py = segment.a.y;
    let s_dx = segment.b.x - segment.a.x;
    let s_dy = segment.b.y - segment.a.y;
    let r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
    let s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
    if (r_dx / r_mag == s_dx / s_mag && r_dy / r_mag == s_dy / s_mag) {
      return null;
    }

    let T2 =
      (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) /
      (s_dx * r_dy - s_dy * r_dx);
    let T1 = (s_px + s_dx * T2 - r_px) / r_dx;

    if (T1 < 0) {
      return null;
    }
    if (T2 < 0 || T2 > 1) {
      return null;
    }

    return {
      x: r_px + r_dx * T1,
      y: r_py + r_dy * T1,
      param: T1
    };
  }

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

    this.occlusionSegments = this.occlusionPolygons.map(
      this.occlusionPolygonToOcclusionSegments
    );

    console.log(this.occlusionSegments);

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
  }

  lightFollowMouse() {
    this.castRays();
    this.createcircle();
  }
}
