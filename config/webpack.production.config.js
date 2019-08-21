const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  phaser,
  phaserModule,
  nodeModules,
  dist,
  ghpages,
  ghPagesAppName
} = require('./paths');
const TerserPlugin = require('terser-webpack-plugin');

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

const minimizePlugin = new TerserPlugin({
  extractComments: true,
  cache: true,
  parallel: true,
  sourceMap: true, // Must be set to true if using source-maps in production
  terserOptions: {
    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
    extractComments: 'all',
    compress: {
      drop_console: true
    }
  }
});

module.exports = (env, options) => {
  return {
    mode: 'production',
    output: {
      path: env.ghpages ? ghpages : dist,
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js',
      publicPath: env.ghpages ? `/${ghPagesAppName}/` : '/'
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
          test: /\.(png|jpg|gif|ico|svg|pvr|pkm|static|mp3|webm)$/,
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
                localsConvention: 'dashes',
                sourceMap: true
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
