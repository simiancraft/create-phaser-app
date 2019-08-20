/*
This takes a level and returns a level.

In Tiles you need to add a layer that will be the location of the output occlusion layer.
On the layer, you add the following properties

occlusion-enabled : Bool
  | A bypass switch.  Must be 'true' to be processed

occlusion-group: Int
  | The occlusion group that will be targeted by in-game entities. Its will eventually be possible to have more than one.

occlusion-input: String
  | The tilemap layer you're using to make polygons from. If there's no valid target, you'll just use whatever polygons are already there. (if any)


The purpose of 'targeting' a polygon group and not simply 'injecting' a polygon layer completely is for a few reasons
1. you can add more relevant meta information to the properties
2. you have more freedom to target a particular z-index. Maybe the light or raycasts go 'behind something'? In front?
3. You can draw freeform polygons also! Targeting some other layer to generate them is optional.

*/

import _ from 'lodash';

import { tilemapLayerToPolygons } from '../../src/plugins/lightrays/tilemap-to-polygon';

const OCCLUSION_ENABLED = 'occlusion-enabled';
const OCCLUSION_GROUP = 'occlusion-group';
const OCCLUSION_INPUT = 'occlusion-input';

function getOtherLayer(name, layers) {
  return _.find(layers, { name: name }) || null;
}

const layertoOccludingLayer = ({ layers, level }) => (layer, layerIndex) => {
  if (
    !layer.properties ||
    !_.find(layer.properties, { name: OCCLUSION_INPUT })
  ) {
    return layer;
  }

  const occlusionInputLayer = {
    ...getOtherLayer(
      _.find(layer.properties, { name: OCCLUSION_INPUT }).value,
      layers
    )
  };

  if (!occlusionInputLayer) {
    return layer;
  }

  let polygonRegions = tilemapLayerToPolygons({
    tilemapLayer: occlusionInputLayer,
    level
  });

  let outputLayer = {
    ...layer,
    objects: [
      ...layer.objects,
      ...tiledObjLayerObjsFromPolyRegions(polygonRegions, layerIndex)
    ]
  };

  return outputLayer;
};

function tiledObjLayerObjsFromPolyRegions(polyRegions, lIndex) {
  return polyRegions.map((pRegion, pRegionIndex) => {
    let obj = {
      height: 0,
      id: lIndex * pRegionIndex + 9000,
      name: `occlusion-polygon-${lIndex}-${pRegionIndex}`,
      polygon: pRegion.map(ptsToXyPts),
      rotation: 0,
      type: '',
      visible: true,
      width: 0,
      x: 0,
      y: 0
    };
    return obj;
  });
}

function ptsToXyPts(pRegionPt) {
  return {
    x: pRegionPt[0],
    y: pRegionPt[1]
  };
}

function addOcclusionLayers(inputLevel) {
  const { layers } = inputLevel;

  let outputLevel = { ...inputLevel };

  outputLevel.layers = layers.map(
    layertoOccludingLayer({ layers, level: inputLevel })
  );

  return outputLevel;
}

export default addOcclusionLayers;

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
