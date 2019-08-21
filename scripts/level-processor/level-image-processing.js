import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import chalk from 'chalk';
import chalkTable from 'chalk-table';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import moment from 'moment';
import multimeter from 'multimeter';
import { forEach } from 'p-iteration';

function templateImageImportFile(embeddedLevel, inputDir, outputDir) {
  const { layers, tilesets } = embeddedLevel;
  const outputPath = `${outputDir}/images.js`;

  const templateImgImport = (file, name) => {
    let cleanName = kebabToCamel(name);
    return `import ${cleanName} from './${file}';`;
  };

  const layersWithimages = layers.filter(layer => {
    return layer.image;
  });

  const tileSetsWithImages = tilesets.filter(tileset => {
    return tileset.image;
  });

  const layerImps = layersWithimages
    .map(({ image, name }) => templateImgImport(image, name))
    .join(`\n`)
    .trim();

  const tilesetImps = tileSetsWithImages
    .map(({ image, name }) => templateImgImport(image, name))
    .join(`\n`)
    .trim();

  const layerExps = layersWithimages
    .map(({ name }) => {
      let cleanName = kebabToCamel(name);
      return `\t'${name}':${cleanName}`;
    })
    .join(',\n')
    .trim();

  const tilesetExps = tileSetsWithImages
    .map(({ name }) => {
      let cleanName = kebabToCamel(name);
      return `\t'${name}':${cleanName}`;
    })
    .join(',\n')
    .trim();

  const f = (thing, chars) => {
    return thing.length > 1 ? chars : '';
  };

  const notes = `/*
This file was generated
by the level-processor
${moment(new Date()).format('YYYY-MM-DD h:mm:ss a')}
*/`;

  const layerImageExports = `${f(layerExps, '\t')}${layerExps}${f(
    layerExps,
    ','
  )}`;

  const tilesetExports = `${f(layerExps, '\n')}${f(
    tilesetExps,
    '\t'
  )}${tilesetExps}`;

  const fileTemplate = `${notes}
${layerImps}${f(layerImps, '\n')}
${tilesetImps}${f(tilesetImps, '\n')}
export default {
${layerImageExports}
${tilesetExports}
};`;

  return fs.writeFileSync(outputPath, fileTemplate);
}

function moveImageToProcessedFolder(inDir, outDir) {
  return async function(img, index, list) {
    //console.log(chalk.green(`📷 ${img}`));

    const inPath = `${inDir}/${img}`.replace(/\\/g, '/');
    const outPath = `${outDir}/${img}`.replace(/\\/g, '/');

    let _compressedImg = await imagemin([inPath], {
      destination: outDir,
      glob: false,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8]
        })
      ]
    });

    return { img, moved: path.relative(inPath, outPath), data: _compressedImg };
  };
}

async function moveLayerImages(embeddedLevel, inDir, outDir) {
  const { layers } = embeddedLevel;
  const layersWithimages = layers
    .filter(layer => {
      return layer.image;
    })
    .map(x => x.image);

  let images = await Promise.all(
    layersWithimages.map(moveImageToProcessedFolder(inDir, outDir))
  );

  if (images.length) {
    let info = chalkTable(
      {
        columns: [
          { field: 'img', name: chalk.white(`📷`) },
          { field: 'moved', name: chalk.yellow('➥') }
        ]
      },
      images
    );

    console.log(info);
  }

  return images;
}

function kebabToCamel(name) {
  return name.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
}

export default templateImageImportFile;
export { templateImageImportFile, moveLayerImages };
