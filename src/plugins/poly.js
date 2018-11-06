function polygonFromTile(tile) {
  const { pixelX, pixelY, height, width } = tile;

  return [
    [pixelX, pixelY],
    [pixelX, pixelY + height],
    [pixelX + width, pixelY + height],
    [pixelX + width, pixelY]
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
  return getSpecialTiles(tilesets)[tile.index - 1];
}

function polygonFromTilesets(tile, tilesets) {
  const specialPoly = getSpecialPoly(tile, tilesets);

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
            //this is some weird deal with the poly appearing in the wrong spot?
            // so I correct it here.
            // only affect the left ones though!
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

function tileToPolygon(tile, tilesets) {
  return polygonFromTilesets(tile, tilesets) || polygonFromTile(tile);
}

export default tileToPolygon;
export { polygonFromTile, polygonFromTilesets };
