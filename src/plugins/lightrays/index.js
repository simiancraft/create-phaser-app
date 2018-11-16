import Phaser from 'phaser/src/phaser.js';

import calulateRaycastPolygon from './rays';
import { polygonLayerToOcclusionPolygons } from './tilemap-to-polygon';

export default class LightraysPlugin extends Phaser.Plugins.BasePlugin {
  constructor(scene) {
    super('LightraysPlugin', scene);
    this.scene = scene;
  }

  init(name) {
    console.log('Lightrays says hello');
    console.log(this);
  }

  load({ name }) {
    console.log(this);
  }

  drawPolygon = (thisPolygon, lineStyle) => {
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

  ptToFlatPt = pt => {
    return [pt.x, pt.y];
  };

  layerObjToOcclusionPolygon = obj => {
    return obj.polygon.map(this.ptToFlatPt);
  };

  //TODO: simplify this so there's less mapping
  createOcclusionLayer({ layer, level }) {
    this.occlusionPolygons = layer.objects.map(this.layerObjToOcclusionPolygon);

    //console.log(this.occlusionPolygons);

    // this.occlusionPolygons.forEach(pGon => {
    //   this.drawPolygon(pGon);
    // });

    this.occlusionSegments = this.occlusionPolygons
      .map(this.occlusionPolygonToOcclusionSegments)
      .flat();

    let allPts = this.segmentsToPoints(this.occlusionSegments);
    this.occlusionPoints = this.pointsToUniquePoints(allPts);

    this.occlusionLayer = {
      occlusionPolygons: this.occlusionPolygons,
      occlusionSegments: this.occlusionSegments,
      occlusionPoints: this.occlusionPoints
    };

    return this.occlusionLayer;
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

    let beam = calulateRaycastPolygon(
      this.occlusionPoints,
      this.occlusionSegments,
      {
        x: worldX,
        y: worldY
      }
    );

    let beams = [beam];
    var fuzzyRadius = 8;
    var p2 = Math.PI * 2;
    var incrementByAngle = p2 / 3;
    for (var angle = 0; angle < p2; angle += incrementByAngle) {
      var dx = Math.cos(angle) * fuzzyRadius;
      var dy = Math.sin(angle) * fuzzyRadius;
      let sympatheticBeam = calulateRaycastPolygon(
        this.occlusionPoints,
        this.occlusionSegments,
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
      this.lightGraphics.setAlpha(0.15);
    }

    this.lightGraphics.clear();
    beams.forEach(b => {
      let points = b.map(i => [i.x, i.y]).flat();
      let thisBeam = new Phaser.Geom.Polygon(points);
      this.lightGraphics.fillStyle(0xffffff);
      this.lightGraphics.fillPoints(thisBeam.points, true);
      //this.lightGraphics.setBlendMode(mode || Phaser.BlendModes.MULTIPLY);
      window.lightGraphics = this.lightGraphics;
      window.Phaser = Phaser;
    });
  }

  drawBakedLights() {
    if (!this.casted) {
      this.casted = this.castRays();
    }

    // this.scene.input.on('pointerdown', pointer => {
    //   console.log(pointer);
    //   this.sun = {
    //     worldX: pointer.worldX,
    //     worldY: pointer.worldY
    //   };
    //   this.casted = this.castRays();
    // });
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
