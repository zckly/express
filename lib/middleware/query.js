/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var parseUrl = require('parseurl');
var qs = require('qs');

/**
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function query(options) {
  var opts = Object.create(options || null);
  var queryparse = qs.parse;

  if (typeof options === 'function') {
    queryparse = options;
    opts = undefined;
  }

  if (opts !== undefined) {
    if (opts.allowDots === undefined) {
      opts.allowDots = false;
    }

    if (opts.allowPrototypes === undefined) {
      opts.allowPrototypes = true;
    }
  }

  return function query(shreq, res, next){
    if (!shreq.query) {
      var val = parseUrl(shreq).query;
      shreq.query = queryparse(val, opts);
    }

    next();
  };
};
