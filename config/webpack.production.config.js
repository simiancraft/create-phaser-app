const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { phaser, phaserModule, nodeModules, dist, ghpages } = require('./paths');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const definePlugin = new webpack.DefinePlugin({
  WEBGL_RENDERER: true,
  CANVAS_RENDERER: true,
  'typeof SHADER_REQUIRE': JSON.stringify(false),
  'typeof CANVAS_RENDERER': JSON.stringify(true),
  'typeof WEBGL_RENDERER': JSON.stringify(true),
  'process.env.NODE_ENV': JSON.stringify('production')
});

const htmlPlugin = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: './index.html'
});

const minimizePlugin = new UglifyJsPlugin({
  parallel: true,
  extractComments: true
});

module.exports = (env, options) => {
  return {
    mode: 'production',
    output: {
      path: env.ghpages ? ghpages : dist,
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js',
      publicPath: env.ghpages ? '/create-phaser-app/' : '/'
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    plugins: [definePlugin, htmlPlugin, minimizePlugin],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [nodeModules],
          use: {
            loader: 'babel-loader?cacheDirectory'
          }
        },
        {
          test: /\.(png|jpg|gif|ico|svg|pvr|pkm|static|ogg|mp3|wav)$/,
          exclude: [nodeModules],
          use: ['file-loader']
        },
        {
          test: [/\.vert$/, /\.frag$/],
          exclude: [nodeModules],
          use: 'raw-loader'
        },

        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]_[local]_[hash:base64]',
                sourceMap: true,
                minimize: true
              }
            }
          ]
        }
      ]
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  };
};
