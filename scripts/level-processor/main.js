console.log('Processing Levels');

//TODO:
/*
- Squish images

- update the processor to ignore layerr that are 'raw input'
by allowing the user to mark them as irrelevant in Tiled

- Same thing with tilemaps! Mark the input tilemap as irrelevant

- Document this and teach users how to use the level processor
*/

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import globby from 'globby';
import _ from 'lodash';
import { extrudeTilesetToImage } from 'tile-extruder';

import { ROOT_PATH } from '../paths';
import addOcclusionLayers from './add-occlusion-layers';
import {
  BASE_HEIGHT,
  BASE_WIDTH,
  COLOR,
  INPUT_ONLY_PROP,
  MARGIN,
  PROCESSED_FOLDER,
  RAW_FOLDER,
  SPACING,
  TEMP_FOLDER
} from './consts';
import {
  moveLayerImages,
  templateImageImportFile
} from './level-image-processing';

const LEVELS_INPUT_PATH = path.posix
  .resolve(__dirname, `../../src/assets/levels/${RAW_FOLDER}/**/*.json`)
  .replace(/\\/g, '/');

async function getLevelsPaths() {
  let t = await globby(LEVELS_INPUT_PATH);
  return t;
}

async function extrudeTileset({
  input,
  output,
  width,
  height,
  spacing,
  margin
}) {
  console.table({
    input,
    output,
    width: width || BASE_WIDTH,
    height: height || BASE_HEIGHT,
    margin: margin || MARGIN,
    spacing: spacing || SPACING
  });
  let extrudedTileset;
  try {
    extrudedTileset = await extrudeTilesetToImage(
      width || BASE_WIDTH,
      height || BASE_HEIGHT,
      input,
      output,
      {
        margin: margin || MARGIN,
        spacing: spacing || SPACING,
        color: COLOR
      }
    );
  } catch (err) {
    console.log(chalk.red(`Error extruding: ${input}`));
    console.log(chalk.red(err));
  }
  return extrudedTileset;
}

function getOutputPath(inputPath) {
  return path.resolve(
    inputPath.replace(`${RAW_FOLDER}`, `${PROCESSED_FOLDER}`)
  );
}

function withoutInputLayers(layer) {
  if (
    layer.properties &&
    _.find(layer.properties, { name: INPUT_ONLY_PROP }) &&
    _.find(layer.properties, { name: INPUT_ONLY_PROP }).value === true
  ) {
    return false;
  }

  return true;
}

async function rewriteLevel(inputPath, index) {
  inputPath = path.resolve(inputPath);
  const outputPath = getOutputPath(inputPath);
  const level = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const { tilesets, layers } = level;
  const thisDir = path.dirname(inputPath);

  //gathers external tilesets for embedding
  if (!tilesets) {
    //there's not any tilesets
    return;
  }

  let gid = 1;

  function tileSetToFullyEmbeddedTileset(tileset, index) {
    //the user embedded the tilemap, so just.. give it back!
    if (!tileset.source) {
      return tileset;
    }
    // the user has NOT embedded the tileset, so we are
    // going to go get it and the 'output'
    // in the processed folder, that shall be embedded
    let _jsonSource = tileset.source.replace('.tsx', '.json');
    let externalTileset = fs.readFileSync(
      path.resolve(__dirname, thisDir, _jsonSource)
    );

    return JSON.parse(externalTileset);
  }

  function tilesetToCorrectedTileset(tileset, index) {
    const {
      image,
      tileheight,
      tilewidth,
      spacing,
      margin,
      columns,
      imageheight,
      imagewidth,
      type
    } = tileset;

    const levelImageInputPath = path.resolve(__dirname, thisDir, image);
    const levelImageOutputPath = getOutputPath(levelImageInputPath);

    // TODO: the underplaying tileset extruder is NOT async!
    // if I want to do minification and things like that
    // I'll likely need to fix this.
    let extrudedTileset = extrudeTileset({
      input: levelImageInputPath,
      output: levelImageOutputPath,
      width: tilewidth,
      height: tileheight,
      spacing: spacing,
      margin: margin
    });

    const rows = Math.round(imageheight / (tileheight + spacing));
    const currentGid = gid;
    gid = gid + tileset.tilecount;

    return {
      ...tileset,
      ...{
        margin: margin + 1,
        spacing: spacing + 2,
        imageheight: rows * (tileheight + spacing + 2),
        imagewidth: columns * (tilewidth + spacing + 2),
        firstgid: currentGid
      }
    };
  }

  const fullyEmbeddedTilesets = tilesets.map(tileSetToFullyEmbeddedTileset);
  const correctedTilesets = fullyEmbeddedTilesets.map(
    tilesetToCorrectedTileset
  );
  const updatedLayers = layers.filter(withoutInputLayers);

  let processedLevel = {
    ...level,
    ...{
      layers: updatedLayers,
      tilesets: correctedTilesets
    }
  };

  //Build occlusion layers.
  processedLevel = addOcclusionLayers(processedLevel);

  //Move images to build folder and template images.js
  // TODO: maybe move all the images at one time by putting them in a queue?
  let movedImages = await moveLayerImages(
    processedLevel,
    thisDir,
    getOutputPath(thisDir)
  );
  templateImageImportFile(processedLevel, thisDir, getOutputPath(thisDir));

  //write the completed Json!
  const newLevelFileContents = JSON.stringify(processedLevel);
  let rewrittenLevel = fs.writeFileSync(outputPath, newLevelFileContents);
  return await Promise.all([movedImages, rewrittenLevel]);
}

async function processLevels(data) {
  var levelPaths = await getLevelsPaths();
  console.log(chalk.green(`Found levels:`));
  levelPaths.forEach(l => {
    console.log(chalk.white(`📁 ${l}`));
  });
  return levelPaths.map(rewriteLevel);
}

function getDirectories(srcpath) {
  return fs
    .readdirSync(srcpath)
    .map(file => path.join(srcpath, file))
    .filter(path => fs.statSync(path).isDirectory());
}

function prepOutputDirectory() {
  const rawDirectories = getDirectories(
    path.resolve(__dirname, `../../src/assets/levels/${RAW_FOLDER}`)
  );

  rawDirectories.forEach(dir => {
    const outDir = getOutputPath(dir);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
  });
}

prepOutputDirectory();

processLevels().then(() => {
  console.log(chalk.green('All Levels Processed'));
});
