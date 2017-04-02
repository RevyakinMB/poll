var gulp = require('gulp'),
	//uglify = require('gulp-uglify'),
	//sourcemaps = require('gulp-sourcemaps'),
	//del = require('del'),
	//_if = require('gulp-if'),

	baseDir = 'app/public',
	paths = [
		baseDir + '/**/*.module.js',
		baseDir + '/**/*.js',
		'!' + baseDir + '/**/*.spec.js',
		'!' + baseDir + '/app.js',
		'!' + baseDir + '/{bower_components, po}/**'
	],
	env = process.env.NODE_ENV || 'development',
	production = env === 'production',

	gulpTask = function (name, path, options) {
		options = options || {};
		options.taskName = name;

		gulp.task(name, function(callback) {
			var task = require(path).call(this, options);
			return task(callback);
		});
	},

	opts = {
		baseDir: baseDir
	};

gulpTask('watch', './tasks/watch.js', { paths: paths });
gulpTask('build', './tasks/build.js', Object.assign(opts, {
		paths: paths,
		production: production
	}));
gulpTask('pot', './tasks/pot.js', opts);

gulpTask('translations', './tasks/translations.js', opts);

gulpTask('browser-sync', './tasks/sync.js', Object.assign(opts, {
		proxy: 'localhost:8080'
	}));
gulpTask('lint', './tasks/lint.js', Object.assign(opts, {
		eslintConfPath: '.eslintrc.js'
	}));

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'browser-sync')));
