'use strict';

// This file is just for testing, the real toolkit will always use gulp, and then
// start our tasks with it by calling the fabricator we have exported with index.js.

var fabricator = require('./index');
var gulp       = require('gulp');
var gutil      = require('gulp-util');

gulp.task('default', function () {
	fabricator(require('./test/fabricatorConfig'), gutil.env.dev);
});
