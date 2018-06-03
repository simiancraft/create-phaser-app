import './index.css';
import './font-loader';

import CustomPipeline from './rendering-pipelines/CustomPipeline';
import GameScene from './scenes/game';
import Phaser from 'phaser';
import StartScene from './scenes/start';
import constants from './config/constants';

window.Phaser = Phaser;

const config = {
  type: Phaser.AUTO,
  width: constants.WIDTH,
  height: constants.HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: [StartScene],
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
