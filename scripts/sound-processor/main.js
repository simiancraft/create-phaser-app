import fs from 'fs';
import path from 'path';

import { objectExpression } from '@babel/types';
import audiosprite from 'audiosprite';
import chalk from 'chalk';
import globby from 'globby';
import _ from 'lodash';

import {
  PROCESSED_FOLDER,
  RAW_FOLDER,
  SOUNDS_FOLDER,
  TEMP_FOLDER
} from './consts';

const SOUNDS_INPUT_GLOB = path.posix
  .resolve(
    __dirname,
    `../../src/assets/${SOUNDS_FOLDER}/${RAW_FOLDER}/**/*.{wav,mp3,ogg}`
  )
  .replace(/\\/g, '/');

const SOUNDS_INPUT_DIR = path.posix
  .resolve(__dirname, `../../src/assets/${SOUNDS_FOLDER}/${RAW_FOLDER}/`)
  .replace(/\\/g, '/');

function getOutputDir(inputPath) {
  return path.resolve(
    inputPath.replace(`${RAW_FOLDER}`, `${PROCESSED_FOLDER}`)
  );
}

async function getRawSoundsPaths() {
  let s = await globby(SOUNDS_INPUT_GLOB);
  return s;
}

async function processSounds() {
  const soundsPaths = await getRawSoundsPaths();
  console.log(soundsPaths);

  const outPutDir = getOutputDir(SOUNDS_INPUT_DIR);
  const outputFileName = `sounds`;

  const opts = {
    output: `${outPutDir}/${outputFileName}`,
    format: 'howler2',
    export: 'webm,mp3'
  };
  const files = soundsPaths;

  audiosprite(files, opts, function(err, obj) {
    if (err) {
      return console.error(err);
    }

    //fix the relative paths, src
    const _imports = _.map(obj.src, _path => {
      return {
        name: `${path
          .basename(_path)
          .split('.')
          .join('_')}`,
        path: `./${path.basename(_path)}`
      };
    });
    let _srcNames = _imports.map(l => l.name.toString());
    obj.src = _srcNames;

    const _json = JSON.stringify(obj, null, 2);
    const _importsString = makeImportsString(_imports);

    let template = `
${_importsString};
import {Howl, Howler} from 'howler';
const config = ${_json};
const sounds = new Howl(config)
export default sounds;
export { Howl, Howler, sounds };
`;

    _.each(_srcNames, (srcName, index) => {
      template = template.replace(`"${srcName}"`, srcName);
    });

    fs.writeFileSync(`${outPutDir}/index.js`, template);
  });
}

function makeImportsString(list) {
  return list
    .map((l, i) => {
      return `import ${l.name} from '${l.path}'`;
    })
    .join(';\n');
}

function getDirectories(srcpath) {
  return fs
    .readdirSync(srcpath)
    .map(file => path.join(srcpath, file))
    .filter(path => fs.statSync(path).isDirectory());
}

function prepOutputDirectory() {
  const rawDirectories = getDirectories(
    path.resolve(__dirname, `../../src/assets/${SOUNDS_FOLDER}/${RAW_FOLDER}`)
  );

  rawDirectories.forEach(dir => {
    const outDir = getOutputPath(dir);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
  });
}

prepOutputDirectory();
processSounds().then(() => {
  console.log(chalk.green('All Sounds Processed'));
});
