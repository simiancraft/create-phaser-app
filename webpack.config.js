module.exports = (env, options) => {
  const {mode} = options;
  return mode === 'development'
    ? require('./config/webpack.development.config.js')(env, options)
    : require('./config/webpack.production.config.js')(env, options);
};
