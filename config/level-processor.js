console.log('Processing Levels');

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

  const updateTilesets = tilesets.map((tileset, index) => {
    const {
      image,
      tileheight,
      tilewidth,
      spacing,
      margin,
      columns,
      imageheight,
      imagewidth
    } = tileset;
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
