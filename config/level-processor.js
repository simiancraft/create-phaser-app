console.log('Processing Levels');

//TODO:
/*
- Squish images

- update the processor to ignore layerr that are 'raw input'
by allowing the user to mark them as irrelevant in Tiled

- Same thing with tilemaps! Mark the input tilemap as irrelevant

- Document this and teach users hwo to use the level processor
*/

const path = require('path');
const fs = require('fs');
const tileExtruder = require('tile-extruder');
const log = console.log;
const chalk = require('chalk');
const BASE_WIDTH = 16;
const BASE_HEIGHT = 16;
const MARGIN = 0;
const SPACING = 0;
const COLOR = 0x00000000;
const RAW_FOLDER = 'raw';
const PROCESSED_FOLDER = 'processed';

const globby = require('globby');

const IMAGES_INPUT_PATH = path.resolve(
  __dirname,
  `../src/assets/levels/${RAW_FOLDER}/**/*.png`
);
const LEVELS_INPUT_PATH = path.resolve(
  __dirname,
  `../src/assets/levels/${RAW_FOLDER}/**/*.json`
);

async function getImagesPaths() {
  return await globby([IMAGES_INPUT_PATH]);
}

async function getLevelsPaths() {
  return await globby([LEVELS_INPUT_PATH]);
}

function extrudeTileset({ input, output, width, height, spacing, margin }) {
  logProcess(input, output);
  try {
    tileExtruder(
      width || BASE_WIDTH,
      height || BASE_HEIGHT,
      margin || MARGIN,
      spacing || SPACING,
      COLOR,
      input,
      output
    );
  } catch (err) {
    log(err);
  }
}

function getOutputPath(inputPath) {
  return path.resolve(
    inputPath.replace(`${RAW_FOLDER}`, `${PROCESSED_FOLDER}`)
  );
}

async function rewriteLevel(inputPath, index) {
  inputPath = path.resolve(inputPath);
  const outputPath = getOutputPath(inputPath);
  logProcess(inputPath, outputPath);

  const level = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  const { tilesets } = level;

  const thisDir = path.dirname(inputPath);

  if (!tilesets) {
    //there's not any tilesets
    return;
  }

  const updateTilesets = tilesets
    //tilesets To fully embedded tilesets
    .map(tileset => {
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
    })
    //tilesets to 'fixed' tilesets
    .map((tileset, index) => {
      console.log('tileset');
      console.log(tileset);

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

      console.log('type', type);
      console.log('dir', thisDir);
      console.log('img', image);

      const levelImageInputPath = path.resolve(__dirname, thisDir, image);
      const levelImageOutputPath = getOutputPath(levelImageInputPath);
      extrudeTileset({
        input: levelImageInputPath,
        output: levelImageOutputPath,
        width: tilewidth,
        height: tileheight,
        spacing: spacing,
        margin: margin
      });

      const rows = Math.round(imageheight / (tileheight + spacing));

      return {
        ...tileset,
        ...{
          margin: margin + 1,
          spacing: spacing + 2,
          imageheight: rows * (tileheight + spacing + 2),
          imagewidth: columns * (tilewidth + spacing + 2)
        }
      };
    });

  const newLevel = JSON.stringify({
    ...level,
    ...{
      tilesets: updateTilesets
    }
  });

  return fs.writeFileSync(outputPath, newLevel);
}

function logProcess(input, output) {
  log(chalk.white('\n'));
  log('IN ', chalk.yellow(input));
  log('OUT', chalk.magenta(output));
}

async function processLevels(data) {
  var levelPaths = await getLevelsPaths();
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
    path.resolve(__dirname, `../src/assets/levels/${RAW_FOLDER}`)
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
  log(chalk.green('All Levels Processed'));
});
