import Phaser from 'phaser';
import TextureTintFrag from './TextureTint.frag';
import TextureTintVert from './TextureTint.vert';

const CustomPipeline = new Phaser.Class({
  Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
  initialize: function CustomPipeline(game) {
    //console.log(game.renderer);
    Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
      game: game,
      renderer: game.renderer,
      fragShader: TextureTintFrag,
      vertshader: TextureTintVert,
      topology: game.renderer.gl.TRIANGLES
    });
  }
});

export default CustomPipeline;
