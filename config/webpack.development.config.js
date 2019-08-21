const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const { phaser, phaserModule, nodeModules, dist, dev } = require('./paths');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const definePlugin = new webpack.DefinePlugin({
  WEBGL_RENDERER: true,
  CANVAS_RENDERER: true,
  'typeof SHADER_REQUIRE': JSON.stringify(false),
  'typeof CANVAS_RENDERER': JSON.stringify(true),
  'typeof WEBGL_RENDERER': JSON.stringify(true),
  'process.env.NODE_ENV': JSON.stringify('development')
});

const htmlPlugin = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: './index.html'
});

const browserSyncPlugin = new BrowserSyncPlugin(
  {
    host: process.env.IP || 'localhost',
    port: process.env.PORT || 3000,
    proxy: 'http://localhost:8080/'
  },
  { reload: false }
);

const analyzerPlugin = new BundleAnalyzerPlugin();

module.exports = (env, options) => {
  return {
    devServer: {
      host: '0.0.0.0'
    },
    mode: 'development',
    devtool: 'cheap-eval-source-map',
    output: {
      path: dist,
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js',
      publicPath: '/'
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    plugins: [definePlugin, htmlPlugin, analyzerPlugin, browserSyncPlugin],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [nodeModules],
          use: {
            loader: 'babel-loader'
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
          test: /\.css$/i,
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
