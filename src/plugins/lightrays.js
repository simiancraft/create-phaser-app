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
    ///return cluster.slice(0, 300).map(tileToPolygonTile);
    return cluster.map(tileToPolygonTile);
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

  //TODO: simplify this so there's less mapping
  createPolygonLayerFromTilemapLayer({ tilemapLayer, level }) {
    let { tilesets } = level;

    let clusters = tilemapLayerToTileClumps(tilemapLayer);

    this.occlusionPolygons = clusters
      .map(this.clustersToPolygonClusters(tilesets))
      .map(this.polygonClusterToCombinedRegion)
      .map(this.regionsToFlatPolys);

    this.occlusionSegments = this.occlusionPolygons
      .map(this.occlusionPolygonToOcclusionSegments)
      .flat();

    let allPts = this.segmentsToPoints(this.occlusionSegments);
    this.occlusionPoints = this.pointsToUniquePoints(allPts);
  }

  bindLightToMouse() {
    this._lightsource =
      this._lightsource || new Phaser.Geom.Circle(200, 300, 4);

    const game = this.scene.game;

    //  only move when you click
    const { worldX, worldY } = game.input.mousePointer;
    this._lightsource.setPosition(worldX, worldY);
  }

  drawRay({ a, b }) {
    var line = new Phaser.Geom.Line(a.x, a.y, b.x, b.y);

    this.lineGraphics.strokeLineShape(line);
  }

  segmentsToPoints(segments) {
    let segToPts = AB => {
      return [AB.a, AB.b];
    };

    return segments.map(segToPts).flat();
  }

  pointsToUniquePoints(points) {
    var set = {};
    function toUniq(p) {
      var key = `${p.x}-${p.y}`;
      if (key in set) {
        return false;
      }
      set[key] = true;
      return true;
    }
    return points.filter(toUniq);
  }

  uniquePointsToIntersects(uniquePoints, { x, y }) {
    let intersects = [];

    let segments = this.occlusionSegments;
    let tolerance = 0.00001;
    var len = uniquePoints.length;

    var uniqueAngles = [];
    for (var j = 0; j < len; j++) {
      var uniquePoint = uniquePoints[j];
      var angle = Math.atan2(uniquePoint.y - y, uniquePoint.x - x);
      uniquePoint.angle = angle;
      uniqueAngles.push(angle - tolerance, angle, angle + tolerance);
    }

    var anglesLength = uniqueAngles.length;
    for (var j = 0; j < anglesLength; j++) {
      var angle = uniqueAngles[j];
      // Calculate dx & dy from angle
      var dx = Math.cos(angle);
      var dy = Math.sin(angle);
      // Ray from center of screen to mouse
      var ray = {
        a: { x: x, y: y },
        b: { x: x + dx, y: y + dy }
      };
      // Find CLOSEST intersection
      var closestIntersect = null;
      for (var i = 0; i < segments.length; i++) {
        var intersect = this.getRaySegmentIntersection(ray, segments[i]);
        if (!intersect) continue;
        if (!closestIntersect || intersect.param < closestIntersect.param) {
          closestIntersect = intersect;
        }
      }
      // Intersect angle
      if (!closestIntersect) {
        continue;
      }
      closestIntersect.angle = angle;
      // Add to list of intersects
      intersects.push(closestIntersect);
    }

    intersects = intersects.sort((a, b) => {
      return a.angle - b.angle;
    });

    return intersects;
  }

  sun = {
    worldX: 555,
    worldY: 49
  };

  castRays(mode) {
    if (!this.occlusionPoints) {
      return;
    }

    //const { worldX, worldY } = this.scene.game.input.mousePointer;

    const { worldX, worldY } = this.sun;
    console.log(worldX, worldY);
    if (!this.lineGraphics) {
      this.lineGraphics = this.scene.add.graphics({
        lineStyle: { width: 1, color: 0xaa00aa }
      });
    }

    this.lineGraphics.clear();

    let beam = this.uniquePointsToIntersects(this.occlusionPoints, {
      x: worldX,
      y: worldY
    });

    let beams = [beam];
    var fuzzyRadius = 8;
    var p2 = Math.PI * 2;
    var incrementByAngle = p2 / 2;
    for (var angle = 0; angle < p2; angle += incrementByAngle) {
      var dx = Math.cos(angle) * fuzzyRadius;
      var dy = Math.sin(angle) * fuzzyRadius;
      let sympatheticBeam = this.uniquePointsToIntersects(
        this.occlusionPoints,
        {
          x: worldX + dx,
          y: worldY + dy
        }
      );
      beams.push(sympatheticBeam);
    }

    this.drawLights(beams, mode);
    return true;
  }

  drawLights(beams, mode) {
    console.log(mode);
    if (!this.lightGraphics) {
      this.lightGraphics = this.scene.add.graphics();
      this.lightGraphics.setAlpha(0.2);
    }

    this.lightGraphics.clear();
    beams.forEach(b => {
      let points = b.map(i => [i.x, i.y]).flat();
      let thisBeam = new Phaser.Geom.Polygon(points);
      this.lightGraphics.fillStyle(0xffffff);
      this.lightGraphics.fillPoints(thisBeam.points, true);
      this.lightGraphics.setBlendMode(mode || Phaser.BlendModes.SCREEN);
      window.lightGraphics = this.lightGraphics;
      window.Phaser = Phaser;
    });
  }

  drawBakedLights() {
    if (!this.casted) {
      this.casted = this.castRays();
    }

    this.scene.input.on('pointerdown', pointer => {
      console.log(pointer);
      this.sun = {
        worldX: pointer.worldX,
        worldY: pointer.worldY
      };
      this.casted = this.castRays();
    });
    window.redrawLights = this.redrawLights;
  }

  redrawLights = mode => {
    if (!mode) return;
    this.castRays(mode);
  };

  lightFollowMouse() {
    // console.log({
    //   x: this.scene.game.input.mousePointer.worldX,
    //   y: this.scene.game.input.mousePointer.worldY
    // });
    //this.createcircle();
  }
}

//Testing blend modes.
/*
window.keyz = _.keys(Phaser.BlendModes);
window.key_ind = 0;
window.dankdank = setInterval(() => {
	if(key_ind > keyz.length - 1){ key_ind = 0} else {key_ind++}
  let nextMode = keyz[key_ind]
  console.log(nextMode)
  redrawLights(Phaser.BlendModes[nextMode])
}, 2000)
*/
