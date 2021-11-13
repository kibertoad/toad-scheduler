module.exports = function (config: any) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [{ pattern: 'karmaTests/**/*.ts', type: 'js' }],
    reporters: ['progress'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity,
  })
}
