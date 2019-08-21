import _ from 'lodash';
import Phaser from 'phaser';

import levelImages from '../assets/levels/processed/level-0/images.js';
import level from '../assets/levels/processed/level-0/level-0.json';
import sounds from '../assets/sounds/processed';
import constants from '../config/constants';
import Player from '../sprites/player';

const { WIDTH, HEIGHT, SCALE } = constants;

export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  preload() {
    this.preloadBackground();
    //map
    this.load.image('tiles', levelImages['rock-moss-plants-doors']);

    console.log(level);

    this.load.tilemapTiledJSON('level-0', level);

    let playerSpawnLayer = _.find(level.layers, { name: 'Player-Spawn' });

    if (playerSpawnLayer) {
      playerSpawnLayer = playerSpawnLayer.objects[0];
    }
    let { x, y } = playerSpawnLayer;

    //create playerd
    this.player = new Player({
      scene: this,
      x: x || 200,
      y: y || 400,
      direction: 'right' //this needs to be the spawn player position
    });

    this.player.preload();
  }

  isOcclusionPolygonLayer(layer) {
    return (
      layer.type == 'objectgroup' &&
      layer.properties &&
      _.find(layer.properties, { name: 'occlusion-enabled' }) &&
      _.find(layer.properties, { name: 'occlusion-group' }).value > 0
    );
  }

  processLayer = layer => {
    let layerName = _.camelCase(layer.name);
    if (layer.type === 'tilelayer') {
      this.tilemapLayers[layerName] = this.map.createStaticLayer(
        layer.name,
        this.tilesetImages.tiles,
        0,
        0
      );

      //set props
      if (layer.properties && layer.properties.length) {
        let _thisLayer = this.tilemapLayers[layerName];
        if (_.find(layer.properties, { name: 'collision' }).value) {
          _thisLayer.setCollisionBetween(0, 999);
          this.physics.add.collider(this.player, _thisLayer);
        }
      }
    }
    if (this.isOcclusionPolygonLayer(layer)) {
      this.occlusionLayers[layerName] = this.lightrays.createOcclusionLayer({
        layer: layer,
        level: level
      });
    }
  };

  processTiledLayers() {
    console.log('makig Tilemap');
    this.map = this.make.tilemap({ key: 'level-0' });
    console.log('tilemap made', this.map);
    //Find a way to make this automatic
    this.tilesetImages = {
      tiles: this.map.addTilesetImage('rock-moss-plants-doors', 'tiles')
    };
    this.tilemapLayers = {};
    this.occlusionLayers = {};
    _.each(level.layers, this.processLayer);
  }

  create() {
    this.createBackgrounds(SCALE);
    //create Level

    this.processTiledLayers();

    this.createCamera();
    this.handleDebugging();
    this.player.create();
    this.lightrays.drawBakedLights();
    this.playMusic();
  }

  update() {
    this.player.update();
    this.lightrays.lightFollowMouse();
    this.backgroundImages.backgroundClouds.setTilePosition(
      this.backgroundImages.backgroundClouds.tilePositionX + 0.2,
      0
    );
  }

  playMusic = () => {
    this.title_track = sounds.play('Level_Track');
    sounds.loop(true, this.title_track);
    sounds.volume(0.6, this.title_track);
  };

  preloadBackground() {
    const { layers } = level;
    const backgroundLayers = _.filter(layers, layer => {
      if (
        layer.image &&
        layer.properties &&
        _.find(layer.properties, { name: 'role' }).value === 'background'
      ) {
        return layer;
      } else {
        return null;
      }
    });

    _.each(backgroundLayers, layer => {
      this.load.image(_.camelCase(layer.name), levelImages[layer.name]);
    });
  }

  createCamera() {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.cameras.main.setBackgroundColor('#111111');
  }

  createBackgrounds(scale) {
    const center = {
      width: WIDTH * 0.5,
      height: HEIGHT * 0.5
    };

    const backgroundLayers = level.layers.filter(layer => {
      return (
        layer.visible &&
        layer.type === 'imagelayer' &&
        layer.properties &&
        _.find(layer.properties, { name: 'role' }).value === 'background'
      );
    });

    this.backgroundImages = this.backgroundImages || {};

    _.each(backgroundLayers, layer => {
      let layerName = _.camelCase(layer.name);
      let scrollx = 0;
      let scrolly = 0;

      if (layer.properties.scrollFactorX) {
        scrollx = layer.properties.scrollFactorX;
      }

      if (layer.properties.scrollFactorY) {
        scrolly = layer.properties.scrollFactorY;
      }

      if (layer.properties.fixed) {
        let offsetx = layer.offsetx * 0.5 * SCALE;
        let offsety = layer.offsety * 0.5 * SCALE;

        this.backgroundImages[layerName] = this.add
          .image(center.width + offsetx, center.height + offsety, layerName)
          .setScale(SCALE)
          .setAlpha(layer.opacity)
          .setScrollFactor(scrollx, scrolly);
      } else {
        let offsetx = (layer.offsetx / 2) * SCALE;
        let offsety = (layer.offsety / 2) * SCALE;
        this.backgroundImages[layerName] = this.add
          .tileSprite(center.width, center.height, WIDTH, HEIGHT, layerName)
          .setScale(SCALE)
          .setAlpha(layer.opacity)
          .setScrollFactor(scrollx, scrolly);
      }
    });
  }

  handleDebugging() {
    this.debugGraphics = this.add.graphics();

    if (this.physics.config.debug) {
      this.drawDebug();
    }
  }

  drawDebug() {
    this.map.renderDebug(this.debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    });
  }

  render() {
    this.debug.cameraInfo(this.camera, 32, 32);
    this.debug.spriteCoords(this.player, 32, 500);
  }
}
