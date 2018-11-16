import _ from 'lodash';

function polygonFromTile(tile) {
  const { pixelX, pixelY, height, width } = tile;
  return [
    [pixelX, pixelY],
    [pixelX, pixelY + height],
    [pixelX + width, pixelY + height],
    [pixelX + width, pixelY]
    //[pixelX, pixelY]
  ];
}

let specialTiles = null;

function getSpecialTiles(tilesets) {
  if (!specialTiles) {
    specialTiles = tilesets
      .map(tileset => tileset.tiles)
      .reduce((acc, tileset) => {
        if (!_.isArray(tileset)) {
          return acc;
        }
        let tilesetObj = tileset.reduce((tAcc, tilesetTile) => {
          return { ...tAcc, [tilesetTile.id]: tilesetTile.objectgroup };
        }, {});
        return {
          ...acc,
          ...tilesetObj
        };
      }, {});
  }

  return specialTiles;
}

function getSpecialPoly(tile, tilesets) {
  return getSpecialTiles(tilesets)[tile.index];
}

function objToPolygon(tile, obj) {
  let { x, y } = obj;

  function toFlatPts(pt) {
    let _x = Math.round(pt.x) + tile.pixelX + x;
    let _y = Math.round(pt.y) + tile.pixelY + y;

    let XY = [_x, _y];
    return XY;
  }

  function clockwise(a, b) {
    return a.x - b.x || a.y - b.y;
  }

  let poly = null;

  if (obj && obj.polygon) {
    poly = obj.polygon.map(toFlatPts);
  }

  return poly;
}

function polygonFromTilesets(tile, tilesets) {
  const specialPoly = getSpecialPoly(tile, tilesets);

  if (!specialPoly) {
    return false;
  }

  function objectGroupsToPoly(acc, obj) {
    return objToPolygon(tile, obj) || acc;
  }

  return specialPoly.objects.reduce(objectGroupsToPoly, null) || [];
}

function tileToPolygon(tile, tilesets) {
  return polygonFromTilesets(tile, tilesets) || polygonFromTile(tile);
}

export default tileToPolygon;
export { polygonFromTile, polygonFromTilesets };
