#!/usr/bin/env node

/*
 * Copyright (c) LinkedIn Corporation. All rights reserved. Licensed under the BSD-2 Clause license.
 * See LICENSE in the project root for license information.
 */

var commander = require('commander');
var CLI = require('../dist/cli');

commander.command('run')
  .description('run measurements server')
  .option(
    '-r, --runs <numRuns>',
    'The number of runs to execute',
    50
  )
  .option(
    '-m, --measurements <measurementsList>',
    'Filter the measurements listed in console output (comma-separated list)'
  )
  .option(
    '-p, --port <port>',
    'Port to use for the server'
  )
  .option(
    '-o, --out <outFile>',
    'File to which to save results'
  )
  .option(
    '-s, --serve <staticDirsList>',
    'Directories of static content to serve (comma-separated list)'
  )
  .action(runHandler);

commander.command('view <file>')
  .description('view saved measurements')
  .option(
    '-m, --measurements <measurementsList>',
    'Filter the measurements listed in console output (comma-separated list)'
  )
  .action(viewHandler);

if (process.argv.length === 2) {
  showHelp();
} else {
  commander.parse(process.argv);
}

function getCLIOptions(argValues) {
  return {
    measurementsFilter: argValues.measurements && argValues.measurements.split(','),
    numRuns: argValues.runs && parseInt(argValues.runs, 10),
    outFile: argValues.out,
    port: argValues.port && parseInt(argValues.port, 10),
    staticDirs: argValues.serve
  };
}

function runHandler(args) {
  var options = getCLIOptions(args);
  var cli = new CLI(options);

  cli.run()
    .then(function() {
      process.exit(0);
    })
    .catch(function(error) {
      console.log('Timingz server error ', error);
      process.exit(1);
    });
}

function showHelp() {
  commander.outputHelp();
}

function viewHandler(file, args) {
  var cli = new CLI(getCLIOptions(args));

  cli.view(file);
  process.exit(0);
}
