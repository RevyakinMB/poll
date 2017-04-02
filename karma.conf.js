// Karma configuration
// Generated on Mon Mar 20 2017 19:26:50 GMT+0300 (MSK)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './app/public',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
	  'bower_components/angular/angular.js',
	  'bower_components/angular-route/angular-route.js',
	  'bower_components/angular-resource/angular-resource.js',
	  'bower_components/angular-mocks/angular-mocks.js',
	  'bower_components/angular-gettext/dist/angular-gettext.js',
	  'app.module.js',
	  '**/*.module.js',
      '**/*.js'
    ],

	plugins: [
		'karma-jasmine',
		'karma-chrome-launcher'
	],

    // list of files to exclude
    exclude: [
		'bower_components/**/!(angular|angular-route|angular-resource|angular-mocks|angular-gettext).js',
		'app.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
