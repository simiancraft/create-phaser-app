var fs = require('fs');
var path = require('path');
var _ = require('lodash');

let inArg = 'input=';
let outArg = 'output=';
let delimiterArg = 'delimiter=';

let input = null;
let output = null;
//the string fragment that separates animation
// names from frame numbers.
let delimiter = '_';

let { ROOT_PATH } = require('../paths');

for (let j = 0; j < process.argv.length; j++) {
  let _arg = process.argv[j];
  let inIndex = _arg.indexOf(inArg);
  let outIndex = _arg.indexOf(outArg);
  let delimiterIndex = _arg.indexOf(delimiterArg);

  if (inIndex > -1) {
    input = _arg.substring(inIndex + inArg.length).toString();
    output = `${input
      .split('.')
      .slice(0, -1)
      .join('.')}-behaviors.js`;
    console.log(_arg, inIndex, input);
  }

  if (outIndex > -1) {
    output = _arg.substr(outIndex + outArg.length).toString();
  }

  if (delimiterIndex > -1) {
    delimiter = _arg.substr(delimiterIndex + delimiterArg.length).toString();
  }
}

if (input != null && output != null) {
  console.log(`Generating ${output} from ${input}`);

  buildBehaviorsFromAtlas();
} else {
  console.log(`Specify args ${inArg} and optionally, ${outArg}`);
}

function buildBehaviorsFromAtlas() {
  const animations = buildAnimationsFromAtlas();
  const atlas = path.basename(input);
  const spritemap = atlas.replace('.json', '.png');
  const animationName = atlas.replace('.json', '');
  const zeropad = 5;

  let args = {
    atlas,
    spritemap,
    animationName,
    zeropad,
    animations
  };

  let fileTemplate = generateBehaviorsTemplate(args);

  fs.writeFileSync(output, fileTemplate);
  console.log(`completed ${output} with ${animations.length} behavors`);
}

function buildAnimationsFromAtlas() {
  let inputfile = path.resolve(input);
  let _atlas = fs.readFileSync(inputfile);

  if (!_atlas) {
    console.log(`could not locate ${inputfile}`);
  }
  let _atlasJSON;

  try {
    _atlasJSON = JSON.parse(_atlas);
  } catch {
    throw Error(`Malformed JSON at ${inputfile}`);
  }

  const { textures } = _atlasJSON;

  //TODO: do this for multiple textures in an atlas??
  const texture = textures[0];
  const { frames } = texture;
  const filenames = frames.map(t => t.filename);

  //TODO this isn't really reuseable yet
  let suffixDelimiter = delimiter; //default is _
  let fileEnding = '.png';

  let animationListMap = filenames.reduce((acc, item, index) => {
    let _name = item
      .split(suffixDelimiter)
      .slice(0, -1)
      .join('');

    if (acc[_name]) {
      //console.log('increment');
      acc[_name].frames = acc[_name].frames + 1;
    } else {
      //console.log('add');
      acc[_name] = { name: _name, frames: 1, repeat: -1 };
    }
    return acc;
  }, {});

  const animations = _.chain(animationListMap)
    .map(a => a)
    .sortBy('name')
    .value();

  return animations;
}

function generateBehaviorsTemplate({
  atlas,
  spritemap,
  animationName,
  zeropad,
  animations
}) {
  let _zeropad = zeropad || 5;

  let states = _.reduce(
    animations,
    (acc, animation, index) => {
      let _n = _.camelCase(animation.name);
      acc[_n] = {};
      acc[_n]._onEnter = `function(){as.sequence('${animation.name}');}`;
      for (let i = 0; i < animations.length; i++) {
        let anim = animations[i];
        if (anim.name != animation.name) {
          acc[_n][_.camelCase(anim.name)] = 'function(){}';
        }
      }
      return acc;
    },
    {}
  );
  let stringifiedStates = JSON.stringify(states);

  //lol so dirty. but it works.
  stringifiedStates = stringifiedStates
    .replace(/"function\(\){/g, `function(){`)
    .replace(/}"/g, `}`);

  let className = _.capitalize(animationName);
  let fileTemplate = `
import machina from 'machina';

import AnimationSequencer from '../../lib/animation-sequencer';
import animationList from './${animationName}-animations.js';
import ${animationName}JSON from './${atlas}';
import ${animationName}PNG from './${spritemap}';

const ATLAS_NAME = '${animationName}-atlas';

function makePrefix(name){
  return name + '_';
}

export default class ${className}Behaviors extends machina.Fsm {
  constructor({ scene, entity }) {
    const as = new AnimationSequencer({
      scene,
      entity,
      animationList,
      atlasName: ATLAS_NAME,
      options: ({ name }) => {
        return {
          zeroPad: ${_zeropad},
          suffix: '.png',
          prefix: makePrefix(name) //explode-image_00037.png
        };
      }
    });

    const behavorFsm = {
      namespace: '${animationName}-behaviors',
      initialState: '${animations[0].name}',
      states: ${stringifiedStates}
    };
    super(behavorFsm);
    this.scene = scene;
    this.entity = entity;
  }

  static preload(scene) {
    scene.load.atlas({
      key: ATLAS_NAME,
      textureURL: ${animationName}PNG,
      atlasURL: ${animationName}JSON
    });
  }
}
`;

  return fileTemplate;
}
