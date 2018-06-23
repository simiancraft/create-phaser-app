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
  '../src/assets/levels/raw/**/*.png'
);
const LEVELS_INPUT_PATH = path.resolve(
  __dirname,
  '../src/assets/levels/raw/**/*.json'
);

async function getImagesPaths() {
  return await globby([IMAGES_INPUT_PATH]);
}

async function getLevelsPaths() {
  return await globby([LEVELS_INPUT_PATH]);
}

function extrudeTileset(input, output) {
  logProcess(input, output);
  try {
    tileExtruder(
      BASE_WIDTH,
      BASE_HEIGHT,
      MARGIN,
      SPACING,
      COLOR,
      input,
      output
    );
  } catch (err) {
    log(err);
  }
}

function getOutputPath(inputPath) {
  return inputPath.replace(`/${RAW_FOLDER}/`, `/${PROCESSED_FOLDER}/`);
}

function rewriteLevel(inputPath, index) {
  const outputPath = getOutputPath(inputPath);
  logProcess(inputPath, outputPath);
}

function logProcess(input, output) {
  log(chalk.white('\n'));
  log('IN ', chalk.yellow(input));
  log('OUT', chalk.magenta(output));
}

async function processImages() {
  var imagePaths = await getImagesPaths();
  return imagePaths.map((inputPath, index) => {
    const outputPath = getOutputPath(inputPath);
    return extrudeTileset(inputPath, outputPath);
  });
}

async function processLevels(data) {
  var levelPaths = await getLevelsPaths();
  return levelPaths.map(rewriteLevel);
}

processLevels().then(() => {
  log(chalk.green('All Levels Processed'));
});

// processImages()
//   .then(processLevels)
//   .then(() => {
//     log(chalk.green('All Levels Processed'));
//   });
