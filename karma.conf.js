module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: [{ pattern: 'test/**/*.ts' }, { pattern: 'lib/**/*.ts'}],
    preprocessors: {
      "**/*.ts": "karma-typescript"
    },
    reporters: ['progress', 'karma-typescript'],
    karmaTypescriptConfig: {
      bundlerOptions: {
        acornOptions: {
          ecmaVersion: 'latest',
        },
        resolve: {
          alias: {
            croner: require('path').resolve(__dirname, 'node_modules/croner/dist/croner.cjs'),
          },
          extensions: ['.js', '.json', '.mjs', '.cjs', '.ts', '.tsx'],
        },
        transforms: [
          function (context, callback) {
            if (context.filename && context.filename.endsWith('.cjs')) {
              return callback(undefined, { dirty: true, transformedScript: true })
            }
            return callback(undefined, { dirty: false })
          },
        ],
      },
    },
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity,
  })
}
