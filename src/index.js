import './index.css';
import './font-loader';

import Phaser from 'phaser';

import constants from './config/constants';
import CustomPipeline from './rendering-pipelines/CustomPipeline';
import GameScene from './scenes/game';
import StartScene from './scenes/start';

window.Phaser = Phaser;

const config = {
  type: Phaser.AUTO,
  width: constants.WIDTH,
  height: constants.HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: [
    //  StartScene,
    GameScene
  ],
  pixelArt: true,
  antialias: false,
  callbacks: {
    postBoot: game => {
      game.renderer.addPipeline('Custom', new CustomPipeline(game));
    }
  }
};

const game = new Phaser.Game(config);
window.game = game;
