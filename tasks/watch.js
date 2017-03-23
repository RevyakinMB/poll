var gulp = require('gulp'),
	task = function(options) {
		return function(callback) {
			gulp.watch(options.paths, gulp.series('build'));
		}
	};

module.exports = task;
