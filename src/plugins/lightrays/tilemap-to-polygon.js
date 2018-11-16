import flatten from 'lodash/flatten';
import PolyBool from 'polybooljs';

import tilemapLayerToTileClumps from './clumpy';
import tileToPolygon from './tile-to-polygon';

const clustersToPolygonClusters = tilesets => cluster => {
  function tileToPolygonTile(tile) {
    return tileToPolygon(tile, tilesets);
  }
  return cluster.map(tileToPolygonTile);
};

//This is the format that Polybool craves
function clusterToRegions(r) {
  return {
    regions: [r],
    inverted: false
  };
}

//Unify all regions into a megaregion.
function regionsToCombinedRegion(acc, next) {
  return acc ? PolyBool.union(acc, next) : next;
}

function polygonClusterToCombinedRegion(cluster) {
  return cluster.map(clusterToRegions).reduce(regionsToCombinedRegion);
}

function regionsToFlatPolys(r) {
  return flatten(r.regions);
}

function layerDataTo2d(layer, level) {
  let { data, width, height } = layer;
  let { tilewidth, tileheight } = level;
  let tiles = [];
  let row = [];
  let y = 0;
  let x = 0;

  for (var t = 0, len = data.length; t < len; t++) {
    let tile = {
      id: t,
      index: data[t] - 1,
      pixelX: x,
      pixelY: y,
      width: tilewidth,
      height: tileheight
    };

    row.push(tile);
    y++;

    if (y === width) {
      tiles.push(row);
      y = 0;
      x++;
      row = [];
    }
  }

  return {
    ...layer,
    data: tiles
  };
}

function ensureLayerDatais2D(layer, level) {
  if (layer.width < layer.data.length) {
    return layerDataTo2d(layer, level);
  }

  return layer;
}

function tilemapLayerToPolygons({ tilemapLayer, level }) {
  let { tilesets } = level;
  let _layer = ensureLayerDatais2D(tilemapLayer, level);
  let clusters = tilemapLayerToTileClumps(_layer);

  let polygons = clusters
    .map(clustersToPolygonClusters(tilesets))
    .map(polygonClusterToCombinedRegion)
    .map(regionsToFlatPolys);

  return polygons;
}

function polygonLayerToOcclusionPolygons() {}

export { tilemapLayerToPolygons, polygonLayerToOcclusionPolygons };
