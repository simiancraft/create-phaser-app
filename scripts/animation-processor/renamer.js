var fs = require('fs');
var path = require('path');

let inArg = 'input=';
let outArg = 'output=';
let useDirArg = 'userDir=';

let input = null;
let output = null;
let useDir = true;

for (let j = 0; j < process.argv.length; j++) {
  let _arg = process.argv[j];
  let inIndex = _arg.indexOf(inArg);
  let outIndex = _arg.indexOf(outArg);
  let useDirIndex = _arg.indexOf(useDirArg);

  if (inIndex > -1) {
    input = _arg.substring(inIndex + inArg.length).toString();
    console.log(_arg, inIndex, input);
  }

  if (outIndex > -1) {
    output = _arg.substr(outIndex + outArg.length).toString();
  }

  if (useDirIndex > -1) {
    useDir = _arg.substr(useDirIndex + useDirArg.length) === 'true';
  }
}

if (input != null && output != null) {
  console.log(`replacing ${input} with ${output}`);

  renameOurFiles();
} else {
  console.log(`Specify args ${inArg} and ${outArg}`);
}

function walkSync(dir, filelist) {
  var fs = fs || require('fs');
  var path = path || require('path');
  var files = fs.readdirSync(dir);

  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist.push(walkSync(dir + '/' + file, []));
    } else {
      filelist.push(path.resolve(dir, file));
    }
  });

  filelist = [].concat.apply([], filelist);

  return filelist;
}

function renameOurFiles() {
  let files = walkSync('./');

  files = files.filter((file, index) => {
    return file.indexOf(input) > -1;
  });

  let table = [];

  let convertedFiles = files.map((file, index) => {
    let in_file = path.resolve(__dirname, file);
    let _dir_output = `${output}`;

    if (useDir) {
      segments = in_file.split('\\');
      let this_dir = '';
      if (segments.length > 2) {
        this_dir = segments[segments.length - 2];
      }
      _dir_output = `${this_dir}-${output}`;
    }

    let out_file = in_file.replace(input, _dir_output);
    console.log(out_file);
    table.push({
      input: in_file.substring(__dirname.length),
      output: out_file.substring(__dirname.length)
    });
    return fs.renameSync(in_file, out_file);
  });

  Promise.all(convertedFiles).then(() => {
    console.table(table);
  });
}
