/*
 * Copyright (c) LinkedIn Corporation. All rights reserved. Licensed under the BSD-2 Clause license.
 * See LICENSE in the project root for license information.
 */

import fastStats from 'fast-stats';
import Iteration from './Iteration';

const { Stats } = fastStats;

/**
 * Represents the data for one measurement, holding the measurement's data for
 * all runs and all iterations from each run.
 */
export default class Measurement {
  constructor(measurement, iterations = []) {
    this.name = measurement.name;
    this.iterations = iterations;
    this.cumulativeDurations = [];
    this.cumulativeStats = null;
  }

  get numIterations() {
    return this.iterations.length;
  }

  addIterations(iterations) {
    iterations.forEach((iterationData, i) => {
      let iteration = this.iterations[i];
      if (!iteration) {
        iteration = this.iterations[i] = new Iteration();
      }

      iteration.addRun(iterationData);
    });
  }

  getCumulativeDurations() {
    let { cumulativeDurations } = this;

    if (!cumulativeDurations.length) {
      let iterationDurations = this.iterations.map(
        (iteration) => iteration.getDurations()
      );

      for (let i = 0, l = iterationDurations[0].length; i < l; i++) {
        let cmlDuration = iterationDurations.reduce((sum, durations) => {
          let toAdd = durations[i];
          return toAdd ? sum + toAdd : sum;
        }, 0);
        cumulativeDurations.push(cmlDuration);
      }
    }

    return cumulativeDurations;
  }

  getCumulativeStats() {
    let { cumulativeStats } = this;

    if (!cumulativeStats) {
      cumulativeStats = this.cumulativeStats = new Stats();
      cumulativeStats.push(this.getCumulativeDurations());
    }

    return cumulativeStats;
  }

  getIterations() {
    return this.iterations.slice();
  }

  toPOJO() {
    let { iterations, name } = this;
    return {
      name,
      iterations: iterations.map((iteration) => iteration.toPOJO())
    };
  }

  static fromPOJO(pojo) {
    let iterations = pojo.iterations.map((iteration) => Iteration.fromPOJO(iteration));
    return new Measurement(pojo, iterations);
  }
}
