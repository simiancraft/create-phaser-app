import _ from 'lodash';
import Phaser from 'phaser';

import BackgroundGradient from '../assets/levels/processed/level-0/background-with-planets.png';
import levelImages from '../assets/levels/processed/level-0/images.js';
import level from '../assets/levels/processed/level-0/level-0.json';
import rockTilemap from '../assets/levels/processed/level-0/rock-moss-plants-doors.png';
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

    this.load.tilemapTiledJSON('level-0', level);

    let playerSpawnLayer = _.find(level.layers, layer => {
      return layer.name === 'Player-Spawn';
    });

    if (playerSpawnLayer) {
      playerSpawnLayer = playerSpawnLayer.objects[0];
    }

    //create playerd
    this.player = new Player({
      scene: this,
      x: playerSpawnLayer.x || 200,
      y: playerSpawnLayer.y || 400,
      direction: 'right' //this needs to be the spawn player position
    });

    this.player.preload();
  }

  createStaticLayers() {
    this.map = this.make.tilemap({ key: 'level-0' });
    const tiles = this.map.addTilesetImage('rock-moss-plants-doors', 'tiles');

    const tilemapLayers = _.filter(level.layers, layer => {
      return layer.type === 'tilelayer';
    });

    this.tilemapLayers = {};

    _.each(tilemapLayers, tilemapLayer => {
      let layerName = _.camelCase(tilemapLayer.name);

      this.tilemapLayers[layerName] = this.map.createStaticLayer(
        tilemapLayer.name,
        tiles,
        0,
        0
      );

      //set props
      if (tilemapLayer.properties) {
        if (tilemapLayer.properties.collision) {
          this.tilemapLayers[layerName].setCollisionBetween(0, 999);
          this.physics.add.collider(this.player, this.tilemapLayers[layerName]);
        }
      }
    });
  }

  create() {
    this.createBackgrounds(SCALE);
    //create Level

    this.createStaticLayers();

    this.createCamera();
    this.handleDebugging();
    this.player.create();
  }

  update() {
    this.player.update();
    this.backgroundImages.backgroundClouds.setTilePosition(
      this.backgroundImages.backgroundClouds.tilePositionX + 0.2,
      0
    );
  }

  preloadBackground() {
    const { layers } = level;
    const backgroundLayers = _.filter(layers, layer => {
      if (
        layer.image &&
        layer.properties &&
        layer.properties.role === 'background'
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
        layer.properties.role === 'background'
      );
    });

    _.each(backgroundLayers, layer => {
      let layerName = _.camelCase(layer.name);
      let scrollx = 0;
      let scrolly = 0;
      this.backgroundImages = this.backgroundImages || {};

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
