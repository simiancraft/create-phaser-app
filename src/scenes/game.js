import Phaser from 'phaser';

import backgroundGradient from '../assets/backgrounds/game/background-new.png';
import clouds from '../assets/backgrounds/game/clouds.png';
import mountains from '../assets/backgrounds/game/mountains.png';
import sea from '../assets/backgrounds/game/sea.png';
import rockTilemap from '../assets/levels/processed/new-test-level/rock-and-moss.png';
import level from '../assets/levels/processed/new-test-level/test.json';
import constants from '../config/constants';
import linearScale from '../lib/linear-scale';
import Player from '../sprites/player';

// import moon from '../assets/backgrounds/game/moon.png';

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

    //create playerd
    this.player = new Player({
      scene: this,
      x: 200,
      y: 496
    });

    this.player.preload();
  }
  create() {
    this.createBackground(SCALE);
    //create Level
    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage(
      'rock-and-moss',
      'tilemap-rock-grass'
    );

    this.mapLayerGround = this.map.createStaticLayer('moss-rock', tiles, 0, 0);

    this.mapLayerGround.setCollisionBetween(1, 150);

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
    this.clouds.setTilePosition(this.clouds.tilePositionX - 0.3, 0);
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
    this.load.image('clouds', clouds);
    // this.load.image('moon', moon);\
    this.load.image('mountains', mountains);
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

    this.clouds = this.add
      .tileSprite(center.width, center.height, WIDTH, HEIGHT, 'clouds')
      .setScrollFactor(0, 0);

    this.mountains = this.add
      .tileSprite(center.width, center.height * 0.8, WIDTH, HEIGHT, 'mountains')
      .setScrollFactor(0.1, 0);

    this.add
      .image(center.width, center.height * 2.5, 'sea')
      .setScale(scale)
      .setScrollFactor(0, 0.1);

    // this.add
    //   .image(center.width * 1.6, center.height * 0.4, 'moon')
    //   .setScale(scale)
    //   .setScrollFactor(0, 0);
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
