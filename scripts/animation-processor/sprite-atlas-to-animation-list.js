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
      .join('.')}-animations.js`;
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

  buildAnimationsFromAtlas();
} else {
  console.log(`Specify args ${inArg} and optionally, ${outArg}`);
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

  let fileTemplate = `
    const animations = ${JSON.stringify(animations)};
    export default animations;
  `;

  fs.writeFileSync(output, fileTemplate);
}
