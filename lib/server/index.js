/*
 * Copyright (c) LinkedIn Corporation. All rights reserved. Licensed under the BSD-2 Clause license.
 * See LICENSE in the project root for license information.
 */

import bodyParser from 'body-parser';
import corser from 'corser';
import EventEmitter from 'events';
import express from 'express';
import path from 'path';
import RunResults from '../RunResults';

const CWD = process.cwd();
const DEFAULT_PORT = 8000;

export default class Server extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.runData = [];
    this.runResults = null;
    this.app = this._createApp();
    this.appServer = null;
    this.port = options.port || DEFAULT_PORT;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.appServer = this.app.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  stop() {
    this.appServer.close();
  }

  _createApp() {
    let app = express();
    // Allow cross-origin requests so we can test in real apps.
    app.use(corser.create());

    app.post('/measurements', bodyParser.json(), this._recordRun.bind(this));

    // Serve static directories if specified.
    let { staticDirs } = this.options;
    if (staticDirs) {
      staticDirs.split(',').forEach(
        (dir) => app.use('/', express.static(path.join(CWD, dir)))
      );
    }

    return app;
  }

  _handleRunsFinished() {
    let results = this.runResults = new RunResults(this.runData);
    this.emit('runsFinished', results);
  }

  _recordRun(req, res) {
    let runMeasurements = req.body;
    let { runData } = this;
    runData.push(runMeasurements);

    if (runData.length === this.options.numRuns) {
      res.json({done: true});
      this._handleRunsFinished();
    } else {
      res.json({done: false});
    }
  }
}
