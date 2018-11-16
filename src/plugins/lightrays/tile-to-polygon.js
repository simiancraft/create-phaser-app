function polygonFromTile(tile) {
  const { pixelX, pixelY, height, width } = tile;
  return [
    [pixelX, pixelY],
    [pixelX, pixelY + height],
    [pixelX + width, pixelY + height],
    [pixelX + width, pixelY],
    [pixelX, pixelY]
  ];
}

let specialTiles = null;

function getSpecialTiles(tilesets) {
  if (!specialTiles) {
    specialTiles = tilesets
      .map(tileset => tileset.tiles)
      .reduce((acc, tileset) => {
        return { ...acc, ...tileset };
      }, {});
  }

  return specialTiles;
}

function getSpecialPoly(tile, tilesets) {
  return getSpecialTiles(tilesets)[tile.index];
}

function objToPolygon(tile, obj) {
  function toFlatPts(pt) {
    let _x = Math.round(pt.x) + tile.pixelX;
    let _y = Math.round(pt.y) + tile.pixelY;

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

  return specialPoly.objectgroup.objects.reduce(objectGroupsToPoly, null) || [];
}

function tileToPolygon(tile, tilesets) {
  return polygonFromTilesets(tile, tilesets) || polygonFromTile(tile);
}

export default tileToPolygon;
export { polygonFromTile, polygonFromTilesets };
