'use strict';

var config = require('./config');
var del    = require('del');

module.exports = function (callback) {
	del(config.toolkit.paths.dest.styles, {force: true}, callback);
};
