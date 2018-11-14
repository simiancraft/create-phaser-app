//kind of voodoo here.
function getRaySegmentIntersection(ray, segment) {
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
    (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
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

function calulateRaycastPolygon(uniquePoints, segments, { x, y }) {
  let intersects = [];
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
    var dx = Math.cos(angle);
    var dy = Math.sin(angle);
    var ray = {
      a: { x: x, y: y },
      b: { x: x + dx, y: y + dy }
    };

    // Find CLOSEST intersection
    var closestIntersect = null;
    for (var i = 0; i < segments.length; i++) {
      var intersect = getRaySegmentIntersection(ray, segments[i]);
      if (!intersect) {
        continue;
      }
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

export default calulateRaycastPolygon;

export { getRaySegmentIntersection, calulateRaycastPolygon };
