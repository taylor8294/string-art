export class ThreadBase {
  constructor() {
    this.sampleCanvas = null;
  }
  static lowerNbSegmentsForThread(pegs, idx) {
    pegs.length = idx > 0 ? Math.min(pegs.length, idx + 1) : 0;
  }
  static computeNbSegments(pegs) {
    return pegs.length > 1 ? pegs.length - 1 : 0;
  }
  static iterateOnThread(pegs, color, n, fn) {
    if (n < this.computeNbSegments(pegs)) {
      fn(pegs.slice(n), color);
    }
  }
}