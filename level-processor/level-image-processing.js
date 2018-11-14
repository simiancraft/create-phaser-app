import fs from 'fs';

import chalk from 'chalk';

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

  const layerImageImports = layersWithimages
    .map(({ image, name }) => templateImgImport(image, name))
    .join(`\n`);

  const tilesetImageImports = tileSetsWithImages
    .map(({ image, name }) => templateImgImport(image, name))
    .join(`\n`);

  const layerImageExportNames = layersWithimages
    .map(({ name }) => {
      let cleanName = kebabToCamel(name);
      return `'${name}':${cleanName}`;
    })
    .join(',\n');

  const tilesetImageExportNames = tileSetsWithImages
    .map(({ name }) => {
      let cleanName = kebabToCamel(name);
      return `'${name}':${cleanName}`;
    })
    .join(',\n');

  const fileTemplate = `
  \n
  ${layerImageImports}
  \n
  ${tilesetImageImports}
  export default {
    \n${layerImageExportNames},
    \n${tilesetImageExportNames}
  };
  `;

  return fs.writeFileSync(outputPath, fileTemplate);
}

function moveLayerImages(embeddedLevel, inDir, outDir) {
  function moveImageToProcessedFolder(img) {
    console.log(chalk.green(`➡️ ${img}`));
    var inStr = fs.createReadStream(`${inDir}/${img}`);
    var outStr = fs.createWriteStream(`${outDir}/${img}`);
    inStr.pipe(outStr);
  }

  const { layers } = embeddedLevel;
  const layersWithimages = layers
    .filter(layer => {
      return layer.image;
    })
    .map(x => x.image);

  layersWithimages.forEach(moveImageToProcessedFolder);
}

function kebabToCamel(name) {
  return name.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
}

export default templateImageImportFile;
export { templateImageImportFile, moveLayerImages };
