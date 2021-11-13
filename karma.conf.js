module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai', 'jasmine'],
    files: [{ pattern: 'karmaTests/**/*.js' }],
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
