/*
 * Copyright (c) LinkedIn Corporation. All rights reserved. Licensed under the BSD-2 Clause license.
 * See LICENSE in the project root for license information.
 */

import fastStats from 'fast-stats';

const { Stats } = fastStats;

/**
 * Represents one iteration of a measurement, holding the data for that
 * iteration from across all runs of the measurement.
 */
export default class Iteration {
  constructor(startTimes = [], endTimes = []) {
    this.startTimes = startTimes;
    this.endTimes = endTimes;
    this.durations = [];
    this.stats = null;
  }

  addRun(run) {
    this.startTimes.push(run.startTime);
    this.endTimes.push(run.endTime);
  }

  getDurations() {
    let { durations } = this;

    if (!durations.length && this.startTimes.length) {
      let { endTimes } = this;
      durations = this.durations = this.startTimes.map(
        (startTime, i) => endTimes[i] - startTime
      );
    }

    return durations;
  }

  getStats() {
    let { stats } = this;

    if (!stats) {
      stats = this.stats = new Stats();
      stats.push(this.getDurations());
    }

    return stats;
  }

  toPOJO() {
    return {
      startTimes: this.startTimes.slice(),
      endTimes: this.endTimes.slice()
    };
  }

  static fromPOJO(pojo) {
    return new Iteration(pojo.startTimes, pojo.endTimes);
  }
}
