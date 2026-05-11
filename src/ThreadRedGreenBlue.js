import * as canvas from "./Canvas.js";
import { ThreadBase } from "./ThreadBase.js";

export class ThreadRedBlueGreen extends ThreadBase {
  constructor() {
    super();
    this.threadPegsRed = [];
    this.threadPegsGreen = [];
    this.threadPegsBlue = [];
  }
  get totalNbSegments() {
    return ThreadBase.computeNbSegments(this.threadPegsRed) + ThreadBase.computeNbSegments(this.threadPegsGreen) + ThreadBase.computeNbSegments(this.threadPegsBlue);
  }
  lowerNbSegments(idx) {
    var repartition = this.computeIdealSegmentsRepartition(idx);
    ThreadBase.lowerNbSegmentsForThread(this.threadPegsRed, repartition.red);
    ThreadBase.lowerNbSegmentsForThread(this.threadPegsGreen, repartition.green);
    ThreadBase.lowerNbSegmentsForThread(this.threadPegsBlue, repartition.blue);
  }
  iterateOnThreads(idx, fn) {
    var colors = this.computeIdealSegmentsRepartition(idx);
    ThreadBase.iterateOnThread(this.threadPegsRed, canvas.EColor.RED, colors.red, fn);
    ThreadBase.iterateOnThread(this.threadPegsGreen, canvas.EColor.GREEN, colors.green, fn);
    ThreadBase.iterateOnThread(this.threadPegsBlue, canvas.EColor.BLUE, colors.blue, fn);
  }
  getThreadToGrow() {
    var repartition = this.computeIdealSegmentsRepartition(this.totalNbSegments + 1);
    return repartition.red > 0 && this.threadPegsRed.length < repartition.red + 1 ? {
      thread : this.threadPegsRed,
      color : canvas.EColor.RED
    } : repartition.green > 0 && this.threadPegsGreen.length < repartition.green + 1 ? {
      thread : this.threadPegsGreen,
      color : canvas.EColor.GREEN
    } : {
      thread : this.threadPegsBlue,
      color : canvas.EColor.BLUE
    };
  }
  adjustCanvasData(imgData, invert) {
    var adjustFn;
    var r = 0;
    var g = 0;
    var b = 0;
    adjustFn = invert ? function(val) {
      return(255 - val) / 2;
    } : function(val) {
      return val / 2;
    };
    var numPixels = imgData.length / 4;
    var i = 0;
    for (;i < numPixels;i++) {
      r += imgData[4 * i + 0];
      g += imgData[4 * i + 1];
      b += imgData[4 * i + 2];
      imgData[4 * i + 0] = adjustFn(imgData[4 * i + 0]);
      imgData[4 * i + 1] = adjustFn(imgData[4 * i + 1]);
      imgData[4 * i + 2] = adjustFn(imgData[4 * i + 2]);
    }
    if (!invert) {
      r = 255 * numPixels - r;
      g = 255 * numPixels - g;
      b = 255 * numPixels - b;
    }
    var sum = r + g + b;
    this.frequencyRed = r / sum;
    this.frequencyGreen = g / sum;
    this.frequencyBlue = b / sum;
  }
  enableSamplingFor(color) {
    var colorIdx;
    colorIdx = color === canvas.EColor.RED ? 0 : color === canvas.EColor.GREEN ? 1 : 2;
    this.sampleCanvas = function(canvasData, idx) {
      return canvasData[idx + colorIdx];
    };
  }
  computeIdealSegmentsRepartition(n) {
    var red = n * this.frequencyRed;
    var green = n * this.frequencyGreen;
    var blue = n * this.frequencyBlue;
    var floorRgb = {
      red : Math.floor(red),
      green : Math.floor(green),
      blue : Math.floor(blue)
    };
    for (;floorRgb.red + floorRgb.green + floorRgb.blue < n;) {
      var redShare = red - floorRgb.red / Math.max(1, floorRgb.red + floorRgb.green + floorRgb.blue);
      var greenShare = green - floorRgb.green / Math.max(1, floorRgb.red + floorRgb.green + floorRgb.blue);
      var blueShare = blue - floorRgb.blue / Math.max(1, floorRgb.red + floorRgb.green + floorRgb.blue);
      if (redShare > greenShare && redShare > blueShare) {
        floorRgb.red++;
      } else {
        if (greenShare > redShare && greenShare > blueShare) {
          floorRgb.green++;
        } else {
          floorRgb.blue++;
        }
      }
    }
    return floorRgb;
  }
}