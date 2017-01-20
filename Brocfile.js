/*
 * Copyright (c) LinkedIn Corporation. All rights reserved. Licensed under the BSD-2 Clause license.
 * See LICENSE in the project root for license information.
 */

var babel = require('rollup-plugin-babel');
var merge = require('broccoli-merge-trees');
var Rollup = require('broccoli-rollup');

function getScriptTree(inputTree, entry, dest) {
  return new Rollup(inputTree, {
    inputFiles: ['**/*.js'],
    rollup: {
      entry: entry,
      dest: dest,
      format: 'cjs',
      sourceMap: true,
      plugins: [
        babel({
          presets: ['es2015-rollup'],
          exclude: 'node_modules/**',
          // TODO: Have to do this to exclude the unneeded asyncGenerator helper,
          // but I should figure out why it was being included.
          externalHelpersWhitelist: ['classCallCheck', 'createClass', 'inherits', 'possibleConstructorReturn']
        })
      ]
    }
  });
}

var libTree = 'lib';
var cliTree = getScriptTree(libTree, 'cli/index.js', 'cli.js');
var clientTree = getScriptTree(libTree, 'client/index.js', 'client.js');
var indexTree = getScriptTree(libTree, 'index.js', 'index.js');

module.exports = merge([cliTree, clientTree, indexTree]);
