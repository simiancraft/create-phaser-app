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
      y: playerSpawnLayer.y - playerSpawnLayer.height * 0.5 || 400 //this needs to be the spawn player position
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
      this.tilemapLayers[
        _.camelCase(tilemapLayer.name)
      ] = this.map.createStaticLayer(tilemapLayer.name, tiles, 0, 0);

      if (tilemapLayer.properties) {
      }
    });

    console.log(this);
  }

  create() {
    this.createBackground(SCALE);
    //create Level

    this.createStaticLayers();

    this.tilemapLayers.setCollisionBetween(1, 999);

    this.physics.add.collider(this.player, this.mapLayerRockFloor);

    this.createCamera();
    this.handleDebugging();
    this.player.create();
  }

  update() {
    this.player.update();

    //read from map?
    //this.clouds.setTilePosition(this.clouds.tilePositionX - 0.3, 0);
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
      this.load.image(layer.name, levelImages[layer.name]);
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
    this.cameras.main.setBackgroundColor('#333399');
  }

  createBackground(scale) {
    const center = {
      width: WIDTH * 0.5,
      height: HEIGHT * 0.5
    };
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
