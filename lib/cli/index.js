/*
 * Copyright (c) LinkedIn Corporation. All rights reserved. Licensed under the BSD-2 Clause license.
 * See LICENSE in the project root for license information.
 */

import fs from 'fs';
import printResults from './printResults';
import RunResults from '../RunResults';
import Server from '../server/index';

export default class CLI {
  constructor(options) {
    this.options = options;
    this.server = null;
    this.resolveRunPromise = null;
  }

  run() {
    let { numRuns, port, staticDirs } = this.options;
    let server = this.server = new Server({numRuns, port, staticDirs});

    return new Promise((resolve, reject) => {
      this.resolveRunPromise = resolve;

      server.start()
        .then(() => {
          console.log(`Timingz.js server listening on ${server.port}\n`);
          server.on('runsFinished', this._handleRunResults.bind(this));
        })
        .catch(reject);
    });
  }

  view(filename) {
    let serializedData = fs.readFileSync(filename);
    let results = RunResults.fromPOJO(JSON.parse(serializedData));
    printResults(results, this.options.measurementsFilter);
  }

  _handleRunResults(results) {
    let { measurementsFilter, outFile } = this.options;

    this.server.stop();
    printResults(results, measurementsFilter);

    if (outFile) {
      saveResults(results, outFile);
    }

    this.resolveRunPromise();
  }
}

function saveResults(results, outFile) {
  let data = JSON.stringify(results.toPOJO());
  fs.writeFileSync(outFile, data);
}
