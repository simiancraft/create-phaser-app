import tilemapLayerToTileClumps from './clumpy';
import tileToPolygon from './tile-to-polygon';

const clustersToPolygonClusters = tilesets => cluster => {
    function tileToPolygonTile(tile) {
        return tileToPolygon(tile, tilesets);
    }
    ///return cluster.slice(0, 300).map(tileToPolygonTile);
    return cluster.map(tileToPolygonTile);
};

function polygonClusterToCombinedRegion(cluster) {
    return cluster
        .map(this.clusterToRegions)
        .reduce(this.regionsToCombinedRegion);
}

function regionsToFlatPolys(r) {
    return r.regions.flat();
}

function tilemapLayerToPolygons({ tilemapLayer, level }) {
    let { tilesets } = level;
    let clusters = tilemapLayerToTileClumps(tilemapLayer);

    let polygonLayer = clusters
        .map(clustersToPolygonClusters(tilesets))
        .map(polygonClusterToCombinedRegion);

    console.log(polygonLayer);

    return polygonLayer;
}

function tilemapLayerToPolygonLayer({ tilemapLayer, level }) {
    const layerPolygons = tilemapLayerToPolygons({ tilemapLayer, level });
}

export default tilemapLayerToPolygonLayer;
/*
{
"draworder":"topdown",
"name":"Polygon-Layer",
"objects":[
    {
        "height":0,
        "id":22,
        "name":"",
        "polygon":[
            {
                "x":0,
                "y":0
            },
            {
                "x":22,
                "y":78.3333333333333
            },
            {
                "x":113,
                "y":78.6666666666667
            }],
        "rotation":0,
        "type":"",
        "visible":true,
        "width":0,
        "x":388.666666666667,
        "y":251.333333333333
    },
    {
        "height":0,
        "id":23,
        "name":"",
        "polygon":[
            {
                "x":0,
                "y":0
            },
            {
                "x":36,
                "y":0.333333333333371
            },
            {
                "x":39,
                "y":27.6666666666667
            },
            {
                "x":-5,
                "y":28.6666666666667
            }],
        "rotation":0,
        "type":"",
        "visible":true,
        "width":0,
        "x":502,
        "y":257
    }],
"opacity":1,
"properties":
{
    "occludes":true
},
"propertytypes":
{
    "occludes":"bool"
},
"type":"objectgroup",
"visible":true,
"x":0,
"y":0
}
*/
