import * as canvas from "./Canvas.js";
import { ThreadBase } from "./ThreadBase.js";

export class ThreadMonochrome extends ThreadBase {
  constructor() {
    super();
    this.threadPegs = [];
  }
  get totalNbSegments() {
    return ThreadBase.computeNbSegments(this.threadPegs);
  }
  lowerNbSegments(idx) {
    ThreadBase.lowerNbSegmentsForThread(this.threadPegs, idx);
  }
  iterateOnThreads(idx, fn) {
    ThreadBase.iterateOnThread(this.threadPegs, canvas.EColor.MONOCHROME, idx, fn);
  }
  getThreadToGrow() {
    return{
      thread : this.threadPegs,
      color : canvas.EColor.MONOCHROME
    };
  }
  adjustCanvasData(imgData, invert) {
    var adjustFn;
    adjustFn = invert ? function(val) {
      return(255 - val) / 2;
    } : function(val) {
      return val / 2;
    };
    var numPixels = imgData.length / 4;
    var i = 0;
    for (;i < numPixels;i++) {
      var newColor = adjustFn((imgData[4 * i + 0] + imgData[4 * i + 1] + imgData[4 * i + 2]) / 3);
      imgData[4 * i + 0] = newColor;
      imgData[4 * i + 1] = newColor;
      imgData[4 * i + 2] = newColor;
    }
  }
  enableSamplingFor() {
    if (null === this.sampleCanvas) {
      this.sampleCanvas = function(canvasData, idx) {
        return canvasData[idx + 0];
      };
    }
  }
}