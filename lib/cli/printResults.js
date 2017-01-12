/*
 * Copyright (c) LinkedIn Corporation. All rights reserved. Licensed under the BSD-2 Clause license.
 * See LICENSE in the project root for license information.
 */

import colors from 'colors/safe';
import Table from 'cli-table';

const STATS = ['amean', 'median', 'stddev'];
const PERCENTILES = [25, 50, 75, 95, 99];

/**
 * Prints a formatted summary of run results to the console.
 *
 * Format:
 *   Run Results
 *
 *   Measurement measurement-name durations:
 *   Iteration  Mean  Median  StdDv  25%ile  50%ile  75%ile  95%ile 99%ile
 *   1          ...   ...     ...    ...     ...     ...     ...    ...
 *   2          ...   ...     ...    ...     ...     ...     ...    ...
 *   ...
 *   Cml        ...   ...     ...    ...     ...     ...     ...    ...
 *
 * TODO: Support configuring statistical data points shown.
 * TODO: Support start and end times.
 */
export default function printResults(results, measurementsToShow = []) {
  console.log(colors.bold.underline.green('Run Results\n'));
  let measurements = measurementsToShow.length ?
    results.getMeasurements(measurementsToShow) :
    results.getMeasurements();
  measurements.forEach((measurement) => printMeasurementDurations(measurement));
}

function getCumulativeRow(measurement) {
  let cmlStats = measurement.getCumulativeStats();
  let row = getDataPoints(cmlStats);
  row.unshift('Cml');

  return row;
}

function getDataPoints(stats) {
  let row = [];
  STATS.forEach((stat) => row.push(stats[stat]()));
  PERCENTILES.forEach((percent) => row.push(stats.percentile(percent)));

  return row.map((num) => num.toFixed(3));
}

function getIterationRow(iteration, num) {
  let stats = iteration.getStats();
  let row = getDataPoints(stats);
  row.unshift(num);

  return row;
}

function printMeasurementDurations(measurement) {
  let header = `Measurement ${colors.bold(measurement.name)} durations:`;
  console.log(header);

  // TODO: Warn if all iterations don't have the same number of runs.
  let iterations = measurement.getIterations();
  let dataTable = new Table({
    head: ['Iteration', 'Mean', 'Median', 'StdDv', '25%ile', '50%ile', '75%ile', '95%ile', '99%ile']
  });
  iterations.forEach((iteration, i) => dataTable.push(getIterationRow(iteration, i + 1)));

  if (measurement.numIterations > 1) {
    dataTable.push(getCumulativeRow(measurement));
  }

  // TODO: Cumulative durations.
  console.log(dataTable.toString() + '\n');
}
