import Phaser from 'phaser';

import backgroundGradient from '../assets/backgrounds/game/back-gradient.png';
import moon from '../assets/backgrounds/game/moon.png';
import sea from '../assets/backgrounds/game/sea.png';
import rockTilemap from '../assets/levels/processed/level-1/rock-tilemap.png';
import level from '../assets/levels/processed/level-1/test-level.json';
import constants from '../config/constants';
import linearScale from '../lib/linear-scale';
import Player from '../sprites/player';

const { WIDTH, HEIGHT, SCALE } = constants;

let xxx = document.getElementById('experimental-popup');

const scaledX = linearScale([0, HEIGHT], [0, window.innerHeight]);
const scaledY = linearScale([0, WIDTH], [0, window.innerWidth]);

export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  preload() {
    this.preloadBackground();
    //map
    this.load.image('tilemap-rock-grass', rockTilemap);
    this.load.tilemapTiledJSON('map', level);

    //create player
    this.player = new Player({
      scene: this,
      x: 200,
      y: 300
    });

    this.player.preload();
  }
  create() {
    this.createBackground(SCALE);
    //create Level
    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage(
      'rock-tilemap',
      'tilemap-rock-grass'
    );
    this.mapLayerGrass = this.map.createStaticLayer('grass', tiles, 0, 0);
    this.mapLayerGround = this.map.createDynamicLayer('ground', tiles, 0, 0);
    this.mapLayerGround.setCollisionBetween(1, 50);

    this.physics.add.collider(this.player, this.mapLayerGround);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.cameras.main.setBackgroundColor('#333399');

    this.debugGraphics = this.add.graphics();
    console.log(this);
    if (this.physics.config.debug) {
      this.drawDebug();
    }

    this.player.create();
  }

  update() {
    this.player.update();
  }

  experimentalPopup() {
    var left = scaledX(this.player.x - this.cameras.main.scrollX);
    var top = scaledY(this.player.y - this.cameras.main.scrollY);

    xxx.style.left = `${left}px`;
    xxx.style.top = `${top}px`;
    xxx.innerHTML = `<span>${top}, ${left}</span>`;
  }

  preloadBackground() {
    this.load.image('back-gradient', backgroundGradient);
    this.load.image('moon', moon);
    this.load.image('sea', sea);
  }

  createBackground(scale) {
    const center = {
      width: WIDTH * 0.5,
      height: HEIGHT * 0.5
    };
    this.backGradient = this.add
      .image(center.width, center.height, 'back-gradient')
      .setScale(scale)
      .setScrollFactor(0, 0);

    this.add
      .image(center.width, center.height * 1.4, 'sea')
      .setScale(scale)
      .setScrollFactor(0, 0.1);

    this.add
      .image(center.width * 1.6, center.height * 0.4, 'moon')
      .setScale(scale)
      .setScrollFactor(0, 0);
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
