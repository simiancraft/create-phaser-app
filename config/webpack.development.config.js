const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const { phaser, phaserModule, nodeModules, dist, dev } = require('./paths');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

// https://webpack.js.org/plugins/define-plugin/
const definePlugin = new webpack.DefinePlugin({
  // set vars needed by phaser
  'typeof SHADER_REQUIRE': JSON.stringify(false),
  'typeof CANVAS_RENDERER': JSON.stringify(true),
  'typeof WEBGL_RENDERER': JSON.stringify(true)
});

// https://github.com/jantimon/html-webpack-plugin
const htmlPlugin = new HtmlWebpackPlugin({
  template: './src/index.html'
});

// https://www.npmjs.com/package/browser-sync-webpack-plugin
const browserSyncPlugin = new BrowserSyncPlugin(
  {
    host: process.env.IP || 'localhost',
    port: process.env.PORT || 3000,
    proxy: 'http://localhost:8080/'
  },
  { reload: false } // stop BrowserSync reloading page, leave it to Webpack Dev Server
);

// https://www.npmjs.com/package/webpack-bundle-analyzer
const analyzerPlugin = new BundleAnalyzerPlugin();

module.exports = (env, options) => {
  return {
    devServer: {
      host: '0.0.0.0' // allows external access to host (e.g. for testing on mobile)
    },
    mode: 'development', // dictates webpack defaults (development = faster build, production = smaller filesize)
    output: {
      path: dist,
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js',
      publicPath: '/'
    },
    optimization: {
      splitChunks: {
        chunks: 'all' // separates vendor bundles from main
      }
    },
    plugins: [definePlugin, htmlPlugin, analyzerPlugin, browserSyncPlugin],
    module: {
      rules: [
        { // transpile js using babel
          test: /\.js$/,
          exclude: [nodeModules],
          use: {
            loader: 'babel-loader'
          }
        },
        { // loader for media files https://webpack.js.org/loaders/file-loader/
          test: /\.(png|jpg|gif|ico|svg|pvr|pkm|static|ogg|mp3|wav)$/,
          exclude: [nodeModules],
          use: ['file-loader'] 
        },
        { // loader to import files as a string https://webpack.js.org/loaders/raw-loader/
          test: [/\.vert$/, /\.frag$/],
          exclude: [nodeModules],
          use: 'raw-loader' 
        },
        { // load css as part of js bundle saving a request
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
