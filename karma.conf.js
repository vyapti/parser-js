// Karma configuration
// Generated on Wed Apr 24 2019 17:56:59 GMT-0500 (Central Daylight Time)
module.exports = function(config) {
  const browsers = ['ChromeHeadless'];
  if (!process.env.CI) {
    browsers.push('Chrome')
    browsers.push('Firefox')
  }
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon', 'chai', 'karma-typescript'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'src/**/*.ts' },
      { pattern: 'test/common/**/*.ts' },
      { pattern: 'test/web/**/*.ts' },
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.ts': ['karma-typescript', 'coverage'],
      'test/**/*.ts': ['karma-typescript'],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    coverageReporter: {
      type: 'in-memory',
    },

    // Karma Typescript Config
    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.dev.json',
    },
  });
};
