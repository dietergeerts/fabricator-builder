'use strict';

// modules /////////////////////////////////////////////////////////////////////////////////////////////////////////////

var assemble    = require('fabricator-assemble'),
	browserSync = require('browser-sync'),
	csso        = require('gulp-csso'),
	del         = require('del'),
	fs          = require('fs'),
	gulp        = require('gulp'),
	gutil       = require('gulp-util'),
	gulpif      = require('gulp-if'),
	imagemin    = require('gulp-imagemin'),
	lodash      = require('lodash'),
	minimist    = require('minimist'),
	prefix      = require('gulp-autoprefixer'),
	rename      = require('gulp-rename'),
	reload      = browserSync.reload,
	runSequence = require('run-sequence'),
	sass        = require('gulp-sass'),
	sourcemaps  = require('gulp-sourcemaps'),
	webpack     = require('webpack');


// configuration ///////////////////////////////////////////////////////////////////////////////////////////////////////

var args = minimist(process.argv.slice(2));
var config = lodash.merge({}, require('./fabricatorConfig.json'), args.config ? require(args.config) : {});
config.dev = gutil.env.dev;
config.data.push(config.package);

setupPages(config);
setupBuildConfig(args, config);
setupBuildConfigInfo(config);

/**
 * A buildConfig file is used to add data and fill in placeholders, for example in sass files.
 * If a buildConfig argument is given to the script, we'll use that, otherwise we'll use ours.
 */
function setupBuildConfig(args, config) {
	fs.writeFileSync('./buildConfig.json', JSON.stringify(require(args.buildConfig || './configs/fabricator.json')));
	config.data.push('./buildConfig.json');
}

/**
 * Besides the use of buildConfig, it's possible to list info about these configurations on a
 * separate page. When buildConfigInfo is filled into the config file, we'll add this page.
 */
function setupBuildConfigInfo(config) {
	config.views.push((config.buildConfigInfo ? '' : '!') + './src/views/configuration.html');
	if (config.buildConfigInfo) {
		fs.writeFileSync('./buildConfigInfo.json', JSON.stringify(require(config.buildConfigInfo)));
		config.data.push('./buildConfigInfo.json');
	}
}

/**
 * Pages are included into the views, but when using fabricator as a builder, the calling project
 * will set the pages sources. So if, then we exclude our own pages, and include the ones provided.
 */
function setupPages(config) {
	if (config.pages) {
		config.views.push('!src/views/pages{,/**}');
		config.views = lodash.union(config.views, config.pages);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// webpack
var webpackConfig = require('./webpack.config')(config);
var webpackCompiler = webpack(webpackConfig);


// clean
gulp.task('clean', function (cb) {
	del([config.dest], cb);
});


// styles
gulp.task('styles:fabricator', function () {
	gulp.src(config.src.styles.fabricator)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(rename('f.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.dest + '/assets/fabricator/styles'))
		.pipe(gulpif(config.dev, reload({stream:true})));
});

gulp.task('styles:toolkit', function () {
	gulp.src(config.src.styles.toolkit)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.dest + '/assets/toolkit/styles'))
		.pipe(gulpif(config.dev, reload({stream:true})));
});

gulp.task('styles', ['styles:fabricator', 'styles:toolkit']);


// scripts
gulp.task('scripts', function (done) {
	webpackCompiler.run(function (error, result) {
		if (error) {
			gutil.log(gutil.colors.red(error));
		}
		result = result.toJson();
		if (result.errors.length) {
			result.errors.forEach(function (error) {
				gutil.log(gutil.colors.red(error));
			});
		}
		done();
	});
});


// images
gulp.task('images', ['favicon'], function () {
	return gulp.src(config.src.images)
		.pipe(imagemin())
		.pipe(gulp.dest(config.dest + '/assets/toolkit/images'));
});

gulp.task('favicon', function () {
	return gulp.src('./src/favicon.ico')
		.pipe(gulp.dest(config.dest));
});


// assemble
gulp.task('assemble', function (done) {
	assemble({
		logErrors: config.dev,
		views    : config.views,
		materials: config.materials,
		data     : config.data
	});
	done();
});


// server
gulp.task('serve', function () {

	browserSync({
		server: {
			baseDir: config.dest
		},
		notify: false,
		logPrefix: 'FABRICATOR'
	});

	/**
	 * Because webpackCompiler.watch() isn't being used
	 * manually remove the changed file path from the cache
	 */
	function webpackCache(e) {
		var keys = Object.keys(webpackConfig.cache);
		var key, matchedKey;
		for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
			key = keys[keyIndex];
			if (key.indexOf(e.path) !== -1) {
				matchedKey = key;
				break;
			}
		}
		if (matchedKey) {
			delete webpackConfig.cache[matchedKey];
		}
	}

	gulp.task('assemble:watch', ['assemble'], reload);
	gulp.watch('src/**/*.{html,md,json,yml}', ['assemble:watch']);

	gulp.task('styles:fabricator:watch', ['styles:fabricator']);
	gulp.watch('src/assets/fabricator/styles/**/*.scss', ['styles:fabricator:watch']);

	gulp.task('styles:toolkit:watch', ['styles:toolkit']);
	gulp.watch('src/assets/toolkit/styles/**/*.scss', ['styles:toolkit:watch']);

	gulp.task('scripts:watch', ['scripts'], reload);
	gulp.watch('src/assets/{fabricator,toolkit}/scripts/**/*.js', ['scripts:watch']).on('change', webpackCache);

	gulp.task('images:watch', ['images'], reload);
	gulp.watch(config.src.images, ['images:watch']);

});


// default build task
gulp.task('default', ['clean'], function () {

	// define build tasks
	var tasks = [
		'styles',
		'scripts',
		'images',
		'assemble'
	];

	// run build
	runSequence(tasks, function () {
		if (config.dev) {
			gulp.start('serve');
		}
	});

});
