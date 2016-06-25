'use strict';

var _        = require('lodash');
var nodePath = require('path');

module.exports = function (fabricatorConfig, dev) {

	var config = {};
	var dst = dev ? './dist' : fabricatorConfig.dest;

	config.fabricator = {
		dev: dev,
		paths: {
			data: fabricatorConfig.data,
			dest: {
				base   : dst,
				images : dst + '/assets/fabricator/images',
				samples: dst + '/assets/samples',
				scripts: dst + '/assets/fabricator/scripts',
				styles : dst + '/assets/fabricator/styles'
			},
			docs         : fabricatorConfig.docs,
			favicon      : './src/assets/images/favicon.ico',
            jscsrc       : './.jscsrc',
            jshintrc     : './.jshintrc',
			materials    : fabricatorConfig.materials,
			package      : fabricatorConfig.package,
			samples      : fabricatorConfig.samples,
			scripts      : './src/assets/scripts/fabricator.js',
			styles       : './src/assets/styles/**/*.scss',
			templates    : fabricatorConfig.templates,
			toolkitConfig: './toolkitConfig.json',
			views        : ["./src/views/**/*", "!./src/views/+(layouts)/**"]
		}
	};

	config.toolkit = {
		paths: {
			dest: {
				fonts  : dst + '/assets/toolkit/fonts',
				images : dst + '/assets/toolkit/images',
				scripts: dst + '/assets/toolkit/scripts',
				styles : dst + '/assets/toolkit/styles'
			},
			fonts        : fabricatorConfig.fonts,
			images       : fabricatorConfig.images,
            jscsrc       : fabricatorConfig.jscsrc,
            jshintrc     : fabricatorConfig.jshintrc,
			scripts      : fabricatorConfig.scripts,
			styles       : fabricatorConfig.styles,
			toolkitConfig: fabricatorConfig.toolkitConfig
		}
	};

	config.composeGlob = function () {
		return _(arguments).flatten().value();
	};
    
    config.getWorkingPath = function (path) {
        return nodePath.join(process.cwd(), path);
    };

	return config;
};
