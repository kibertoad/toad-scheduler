module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: [{ pattern: 'test/**/*.ts' }, { pattern: 'lib/**/*.ts'}],
    preprocessors: {
      "**/*.ts": "karma-typescript"
    },
    reporters: ['progress', 'karma-typescript'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity,
  })
}
