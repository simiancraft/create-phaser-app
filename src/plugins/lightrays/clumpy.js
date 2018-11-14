/* 
This file is a set of functions whose purpose is to find 'islands' or 'clumps'
Of tiles in a tilemap with a simple recursive flodfill
*/

function tilemapLayerToTileClumps(tilemapLayer) {
    const clumps = [];

    for (let x = 0; x < tilemapLayer.width; x++) {
        for (let y = 0; y < tilemapLayer.height; y++) {
            const tile = tilemapLayer.getTileAt(x, y, tilemapLayer.index);
            const shouldAddTile = tile && !clumpThatHasTile(tile, clumps);

            if (shouldAddTile) {
                const clump = [];
                gatherNeighbors({
                    x,
                    y,
                    clump,
                    tilemapLayer
                });
                clumps.push(clump);
            }
        }
    }

    return clumps;
}

function gatherNeighbors({ x, y, clump, tilemapLayer }) {
    const tile = tilemapLayer.getTileAt(x, y, tilemapLayer.index);
    const shouldAddTile = tile && clump.indexOf(tile) === -1;

    if (shouldAddTile) {
        clump.push(tile);
        let origin = {
            x,
            y,
            clump,
            tilemapLayer
        };
        const north = { ...origin, ...{ y: y + 1 } };
        const south = { ...origin, ...{ y: y - 1 } };
        const east = { ...origin, ...{ x: x + 1 } };
        const west = { ...origin, ...{ x: x - 1 } };
        gatherNeighbors(north);
        gatherNeighbors(south);
        gatherNeighbors(east);
        gatherNeighbors(west);
    }
}

function clumpThatHasTile(tile, clumps) {
    let clumpsLength = clumps.length;
    for (let ci = 0; ci < clumpsLength; ci++) {
        let clump = clumps[ci];
        let tilesLength = clump.length;
        for (let ti = 0; ti < tilesLength; ti++) {
            let _tile = clump[ti];

            if (tile === _tile) {
                return clump;
            }
        }
    }
    return null;
}

export default tilemapLayerToTileClumps;
