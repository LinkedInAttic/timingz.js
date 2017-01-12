/*
 * Copyright (c) LinkedIn Corporation. All rights reserved. Licensed under the BSD-2 Clause license.
 * See LICENSE in the project root for license information.
 */

import Measurement from './Measurement';

/**
 * Represents the results from executing runs of measurements.
 */
export default class RunResults {
  constructor(runData, shouldTransformData = true) {
    this.measurements = shouldTransformData ? transformRunData(runData) : runData;
  }

  getMeasurements(measurementsToInclude = []) {
    return measurementsToInclude.length ?
      this.measurements.filter((measurement) => measurementsToInclude.indexOf(measurement.name) > -1) :
      this.measurements.slice();
  }

  toPOJO() {
    return {
      measurements: this.measurements.map((measurement) => measurement.toPOJO())
    };
  }

  static fromPOJO(pojo) {
    let measurements = pojo.measurements.map((measurementData) => Measurement.fromPOJO(measurementData));
    return new RunResults(measurements, false);
  }
}

/**
 * Transforms the raw data from the client.
 *
 * Data from the client is grouped by run:
 *   [ // List of all runs.
 *     [ // Each run is an array of measurements.
 *       { // Each measurement contains all the iterations of that measurement for that run.
 *         name: 'my-measurement',
 *         iterations: [
 *           {startTime: ..., endTime: ...}
 *         ]
 *       }
 *     ]
 *   ]
 *
 * This transforms it to be grouped by measurement and wraps data in convenient classes
 * for deriving statistical data.
 *   RunResults([ // List of all measurements.
 *     Measurement({ // Info for a measurement across all runs.
 *       name: 'my-measurement',
 *       iterations: [ // List of all iterations for a measurement, each with data for all runs.
 *         {
 *           // List of this iteration's start times and end times for all runs.
 *           startTimes: [...],
 *           endTimes: [...]
 *         }
 *       ]
 *     })
 *   ])
 */
function transformRunData(runData) {
  let measurementDataObjs = [];
  let measurementDataObjsDict = {};

  runData.forEach((run) => {
    run.forEach((measurement) => {
      var measurementData = measurementDataObjsDict[measurement.name];

      if (!measurementData) {
        measurementData = measurementDataObjsDict[measurement.name] = new Measurement(measurement);
        measurementDataObjs.push(measurementData);
      }

      measurementData.addIterations(measurement.iterations);
    });
  });

  return measurementDataObjs;
}
