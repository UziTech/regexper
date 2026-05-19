module.exports = async function(karma) {
  const puppeteer = require('puppeteer');
  process.env.CHROME_BIN = await puppeteer.executablePath();
  karma.set({
    frameworks: ['jasmine'],
    files: ['spec/test_index.js'],
    preprocessors: {
      'spec/test_index.js': ['webpack', 'sourcemap'],
    },
    reporters: ['progress'],
    colors: true,
    logLevel: karma.LOG_INFO,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    autoWatch: true,
    singleRun: false,
    webpack: {
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
          },
          {
            test: /\.peg$/,
            loader: require.resolve('./lib/canopy-loader'),
          },
        ],
      },
    },
  });
};
