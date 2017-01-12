/*
 * Copyright (c) LinkedIn Corporation. All rights reserved. Licensed under the BSD-2 Clause license.
 * See LICENSE in the project root for license information.
 */

const { performance } = window;

export default class Client {
  constructor(options) {
    // TODO: Add default options.
    this.serverHost = options.serverHost || '';
    this.onNewRun = (typeof options.onNewRun === 'function') ? options.onNewRun : reloadPage;
    this.measurementIterations = {};
  }

  endMeasurement(name) {
    let currentIteration = this.measurementIterations[name];
    performance.mark(`${name}.${currentIteration}.end`);
  }

  endRun() {
    let data = collectMeasurementData(this.measurementIterations);
    sendToServer(`${this.serverHost}/measurements`, data, (response) => {
      if (!response.done) {
        this.startNewRun();
      }
    });
  }

  startMeasurement(name) {
    let { measurementIterations } = this;
    let nextIteration = (measurementIterations[name] || 0) + 1;
    // TODO: Validate that previous iteration has ended.
    performance.mark(`${name}.${nextIteration}.start`);
    measurementIterations[name] = nextIteration;
  }

  startNewRun() {
    this.measurementIterations = {};
    this.onNewRun(reloadPage);
  }
}

function collectMeasurementData(measurementIterations) {
  return Object.keys(measurementIterations).map((measurementName) => {
    let numIterations = measurementIterations[measurementName];
    let measurementData = {
      name: measurementName,
      iterations: []
    };

    for (let i = 1; i <= numIterations; i++) {
      measurementData.iterations.push(retrieveMeasurementIteration(measurementName, i));
    }

    return measurementData;
  });
}

function reloadPage() {
  window.location.reload(true); // true to force reload from server.
}

function retrieveMeasurementIteration(measurementName, iterationNum) {
  let iterationName = `${measurementName}.${iterationNum}`;
  let startMark = performance.getEntriesByName(`${iterationName}.start`, 'mark')[0];
  let endMark = performance.getEntriesByName(`${iterationName}.end`, 'mark')[0];

  return {startTime: startMark.startTime, endTime: endMark.startTime};
}

function sendToServer(url, data, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.addEventListener('load', function() {
    let response = JSON.parse(this.responseText);
    callback(response);
  });
  xhr.send(JSON.stringify(data));
}
