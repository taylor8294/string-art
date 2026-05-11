import { Parameters, EMode, EShape } from "./Parameters.js";
import { Transformation } from "./Transformation.js";
import * as canvas from "./Canvas.js";
import { ThreadMonochrome } from "./ThreadMonochrome.js";
import { ThreadRedBlueGreen } from "./ThreadRedGreenBlue.js";

var negInfinity = -9007199254740991;
var TWO_PI = 2 * Math.PI;
function bound(value, lower, upper) {
  return value < lower ? lower : value > upper ? upper : value;
}
function lerp(start, end, val01) {
  return start * (1 - val01) + end * val01;
}
function randFrom(arr) {
  return 0 === arr.length ? null : arr[Math.floor(Math.random() * arr.length)];
}

export class ThreadComputer {
  constructor(img) {
    this.hiddenCanvasData = null;
    this.sourceImage = img;
    this.hiddenCanvas = document.createElement("canvas");
    this.hiddenCanvasContext = this.hiddenCanvas.getContext("2d", {willReadFrequently: true});
    this.reset(0.0625, 1);
  }
  drawThread(plotter, idx) {
    var that = this;
    var transform = this.computeTransformation(plotter.size);
    var strokeWidth = transform.scaling * this.hiddenCanvasScale * this.lineThickness;
    var operation = Parameters.invertColors ? canvas.ECompositingOperation.LIGHTEN : canvas.ECompositingOperation.DARKEN;
    this.thread.iterateOnThreads(idx, function(coords, color) {
      var transformedCoords = [];
      var i = 0;
      var coordObj = coords;
      for (;i < coordObj.length;i++) {
        var coord = coordObj[i];
        transformedCoords.push(transform.transform(coord));
      }
      plotter.drawBrokenLine(transformedCoords, color, that.lineOpacity, operation, strokeWidth);
    });
  }
  drawPegs(plotter) {
    var transform = this.computeTransformation(plotter.size);
    var opacity = transform.scaling * this.hiddenCanvasScale * 0.5;
    var transformedPegs = [];
    var i = 0;
    var pegs = this.pegs;
    for (;i < pegs.length;i++) {
      var peg = pegs[i];
      transformedPegs.push(transform.transform(peg));
    }
    plotter.drawPoints(transformedPegs, "red", opacity);
  }
  drawDebugView(ctx) {
    var transform = this.computeTransformation(ctx.canvas);
    ctx.drawImage(this.hiddenCanvas, transform.origin.x, transform.origin.y, transform.scaling * this.hiddenCanvas.width, transform.scaling * this.hiddenCanvas.height);
  }
  computeNextSegments(timeout) {
    var computer = this;
    var now = performance.now();
    var nbLines = Parameters.nbLines;
    if (this.nbSegments === nbLines) {
      return false;
    }
    if (this.nbSegments > nbLines) {
      return this.thread.lowerNbSegments(nbLines), this.resetHiddenCanvas(), this.thread.iterateOnThreads(0, function(pegs, color) {
        (0, canvas.applyCanvasCompositing)(computer.hiddenCanvasContext, color, computer.lineOpacityInternal, canvas.ECompositingOperation.LIGHTEN);
        var i = 0;
        for (;i + 1 < pegs.length;i++) {
          computer.drawSegmentOnHiddenCanvas(pegs[i], pegs[i + 1]);
        }
      }), this.computeError(), true;
    }
    var color = null;
    for (;this.nbSegments < nbLines && performance.now() - now < timeout;) {
      var threadToGrow = this.thread.getThreadToGrow();
      if (color !== threadToGrow.color) {
        (0, canvas.applyCanvasCompositing)(this.hiddenCanvasContext, threadToGrow.color, this.lineOpacityInternal, canvas.ECompositingOperation.LIGHTEN);
        this.thread.enableSamplingFor(threadToGrow.color);
        color = threadToGrow.color;
      }
      this.computeSegment(threadToGrow.thread);
      if (this.nbSegments % 100 == 0) {
        this.computeError();
      }
    }
    return true;
  }
  reset(opacity, strokeWidth) {
    this.lineOpacity = opacity;
    this.lineThickness = strokeWidth;
    this.hiddenCanvasScale = Parameters.quality;
    if (Parameters.mode === EMode.MONOCHROME) {
      this.thread = new ThreadMonochrome();
    } else {
      this.thread = new ThreadRedBlueGreen();
    } 
    this.resetHiddenCanvas();
    this.pegs = this.computePegs();
  }
  updateIndicators(setValue) {
    setValue("pegs-count", this.pegs.length.toString());
    setValue("segments-count", this.nbSegments.toString());
    setValue("error-average", this.error.average.toString());
    setValue("error-mean-square", this.error.meanSquare.toString());
    setValue("error-variance", this.error.variance.toString());
  }
  get nbSegments() {
    return this.thread.totalNbSegments;
  }
  get instructions() {
      if (Parameters.mode !== EMode.MONOCHROME) {
        return "Instructions are only available for monochrome mode.";
      }
      if (Parameters.invertColors) {
        return "Instructions are only available for black thread.";
      }
      var maxX = -1;
      var maxY = -1;
      var i = 0;
      var pegs = this.pegs;
      for (;i < pegs.length;i++) {
        var peg = pegs[i];
        if (maxX < peg.x) {
          maxX = peg.x;
        }
        if (maxY < peg.y) {
          maxY = peg.y;
        }
      }
      var instructions = [];
      instructions.push("---");
      instructions.push("# Here are instructions to reproduce this in real life.");
      instructions.push("# For the best result, make sure you used the highest quality mode, highest thread opacity, and thread width that will match your real life thread.");
      instructions.push("# Space units used below are abstract, scale as needed. Typically, you can choose 1 unit = 2 millimeters.");
      instructions.push("generator: https://github.com/taylor8294/string-art");
      instructions.push("reference-image:");
      instructions.push("  - width: ".concat(this.hiddenCanvas.width));
      instructions.push("  - height: ".concat(this.hiddenCanvas.height));
      instructions.push("canvas:");
      instructions.push("  - width: ".concat(maxX.toFixed(2)));
      instructions.push("  - height: ".concat(maxY.toFixed(2)));
      instructions.push("  - pegs: ".concat(pegs.length));
      instructions.push("  - shape: ".concat(EShape[Parameters.shape]));
      instructions.push("  - threads: ".concat(this.thread.totalNbSegments));
      instructions.push("thread:");
      var strokeWidth = this.lineThickness * this.hiddenCanvasScale;
      instructions.push("  - width: ".concat(strokeWidth.toFixed(2)));
      instructions.push("  - opacity: ".concat((this.lineOpacity*100).toFixed(2), "%"));
      instructions.push("  - equivalent-opaque-width: ".concat((strokeWidth * this.lineOpacity).toFixed(2)));
      instructions.push("peg-coordinates:");
      var pegs = this.pegs;
      i = 0;
      for (;i < pegs.length;i++) {
        pegs[i].index = i;
        instructions.push("  - [".concat(pegs[i].x.toFixed(2), ", ").concat(pegs[i].y.toFixed(2), "]"));
      }
      instructions.push("---");
      var pegsString = "";
      this.thread.iterateOnThreads(0, function(pegs) {
        var pegObjs = pegs;
        var i = 0;
        for (;i < pegObjs.length-1;i++) {
          var next = i + 1;
          pegsString = pegsString + pegObjs[i].index.toString().concat(","+(next%25 === 0 && next !== pegObjs.length-1 ? "\n" : " "));
        }
        i = pegObjs.length-1;
        pegsString = pegsString + pegObjs[i].index.toString()
      });;
      return instructions.join("\n")+"\n\n"+pegsString;
  }
  initializeHiddenCanvasLineProperties() {
    var strokeWidth = this.lineThickness * this.hiddenCanvasScale;
    if (strokeWidth <= 1) {
      this.lineOpacityInternal = 0.5 * this.lineOpacity * strokeWidth;
      this.hiddenCanvasContext.lineWidth = 1;
    } else {
      this.lineOpacityInternal = 0.5 * this.lineOpacity;
      this.hiddenCanvasContext.lineWidth = strokeWidth;
    }
  }
  computeSegment(pegs) {
    var peg1;
    var peg2;
    if (0 === pegs.length) {
      var segment = this.computeBestStartingSegment();
      pegs.push(segment.peg1);
      peg1 = segment.peg1;
      peg2 = segment.peg2;
    } else {
      peg1 = pegs[pegs.length - 1];
      var prevNum = Math.min(pegs.length, 20);
      var previousPegs = pegs.slice(-prevNum);
      peg2 = this.computeBestNextPeg(peg1, previousPegs);
    }
    pegs.push(peg2);
    this.drawSegmentOnHiddenCanvas(peg1, peg2);
  }
  resetHiddenCanvas() {
    var bestSize = this.computeBestSize(this.sourceImage, 100 * this.hiddenCanvasScale);
    this.hiddenCanvas.width = bestSize.width;
    this.hiddenCanvas.height = bestSize.height;
    (0, canvas.resetCanvasCompositing)(this.hiddenCanvasContext);
    this.hiddenCanvasContext.drawImage(this.sourceImage, 0, 0, bestSize.width, bestSize.height);
    var imgData = this.hiddenCanvasContext.getImageData(0, 0, bestSize.width, bestSize.height);
    this.thread.adjustCanvasData(imgData.data, Parameters.invertColors);
    this.hiddenCanvasContext.putImageData(imgData, 0, 0);
    this.computeError();
    this.initializeHiddenCanvasLineProperties();
  }
  computeError() {
    this.uploadCanvasDataToCPU();
    this.error = {
      average : 0,
      variance : 0,
      meanSquare : 0
    };
    var numPixels = this.hiddenCanvasData.width * this.hiddenCanvasData.height;
    var len = 3 * numPixels;
    var i = 0;
    for (;i < numPixels;i++) {
      var r = 127 - this.hiddenCanvasData.data[4 * i + 0];
      var g = 127 - this.hiddenCanvasData.data[4 * i + 1];
      var b = 127 - this.hiddenCanvasData.data[4 * i + 2];
      this.error.average += r + g + b;
      this.error.meanSquare += r * r + g * g + b * b;
    }
    this.error.average = Math.round(this.error.average / len);
    this.error.meanSquare = Math.round(this.error.meanSquare / len);
    i = 0;
    for (;i < numPixels;i++) {
      var variance = ((r = 127 - this.hiddenCanvasData.data[4 * i + 0]) + (g = 127 - this.hiddenCanvasData.data[4 * i + 1]) + (b = 127 - this.hiddenCanvasData.data[4 * i + 2])) / 3 - this.error.average;
      this.error.variance += variance * variance;
    }
    this.error.variance = Math.round(this.error.variance / len);
  }
  computeTransformation(size) {
    return new Transformation(size, this.hiddenCanvas);
  }
  drawSegmentOnHiddenCanvas(peg1, peg2) {
    this.hiddenCanvasContext.beginPath();
    this.hiddenCanvasContext.moveTo(peg1.x, peg1.y);
    this.hiddenCanvasContext.lineTo(peg2.x, peg2.y);
    this.hiddenCanvasContext.stroke();
    this.hiddenCanvasContext.closePath();
    this.hiddenCanvasData = null;
  }
  computeBestStartingSegment() {
    var segments = [];
    var maxPotential = negInfinity;
    var numHundreds = 1 + Math.floor(this.pegs.length / 100);
    var i = 0;
    for (;i < this.pegs.length;i += numHundreds) {
      var j = i + 1;
      for (;j < this.pegs.length;j += numHundreds) {
        var peg1 = this.pegs[i];
        var peg2 = this.pegs[j];
        if (!this.arePegsTooClose(peg1, peg2)) {
          var potential = this.computeSegmentPotential(peg1, peg2);
          if (potential > maxPotential) {
            maxPotential = potential;
            segments = [{
              peg1 : peg1,
              peg2 : peg2
            }];
          } else {
            if (potential === maxPotential) {
              segments.push({
                peg1 : peg1,
                peg2 : peg2
              });
            }
          }
        }
      }
    }
    return randFrom(segments);
  }
  computeBestNextPeg(peg1, previousPegs) {
    var bestPegs = [];
    var maxPotential = negInfinity;
    var i = 0;
    var pegs = this.pegs;
    for (;i < pegs.length;i++) {
      var peg2 = pegs[i];
      if (!this.arePegsTooClose(peg1, peg2) && !previousPegs.includes(peg2)) {
        var potential = this.computeSegmentPotential(peg1, peg2);
        if (potential > maxPotential) {
          maxPotential = potential;
          bestPegs = [peg2];
        } else {
          if (potential === maxPotential) {
            bestPegs.push(peg2);
          }
        }
      }
    }
    return randFrom(bestPegs);
  }
  uploadCanvasDataToCPU() {
    if (null === this.hiddenCanvasData) {
      var width = this.hiddenCanvas.width;
      var height = this.hiddenCanvas.height;
      this.hiddenCanvasData = this.hiddenCanvasContext.getImageData(0, 0, width, height);
    }
  }
  computeSegmentPotential(peg1, peg2) {
    this.uploadCanvasDataToCPU();
    var from;
    var to;
    var xDiff;
    var yDiff;
    var potential = 0;
    var len = (to = peg2, xDiff = (from = peg1).x - to.x, yDiff = from.y - to.y, Math.sqrt(xDiff * xDiff + yDiff * yDiff));
    var length = Math.ceil(len);
    var i = 0;
    for (;i < length;i++) {
      var pct = (i + 1) / (length + 1);
      var point = {
        x : lerp(peg1.x, peg2.x, pct),
        y : lerp(peg1.y, peg2.y, pct)
      };
      potential += 127 - (this.sampleCanvasData(point) + 255 * this.lineOpacityInternal);
    }
    return potential / length;
  }
  sampleCanvasData(point) {
    var width = this.hiddenCanvasData.width;
    var height = this.hiddenCanvasData.height;
    var leftX = bound(Math.floor(point.x), 0, width - 1);
    var rightX = bound(Math.ceil(point.x), 0, width - 1);
    var topY = bound(Math.floor(point.y), 0, height - 1);
    var bottomY = bound(Math.ceil(point.y), 0, height - 1);
    var lt = this.sampleCanvasPixel(leftX, topY);
    var rt = this.sampleCanvasPixel(rightX, topY);
    var lb = this.sampleCanvasPixel(leftX, bottomY);
    var rb = this.sampleCanvasPixel(rightX, bottomY);
    var decimalPart = point.x % 1;
    var top = lerp(lt, rt, decimalPart);
    var bottom = lerp(lb, rb, decimalPart);
    return lerp(top, bottom, point.y % 1);
  }
  sampleCanvasPixel(x, y) {
    var idx = 4 * (x + y * this.hiddenCanvasData.width);
    return this.thread.sampleCanvas(this.hiddenCanvasData.data, idx);
  }
  computeBestSize(img, scale) {
    var percent = scale / Math.max(img.width, img.height);
    return{
      width : Math.ceil(img.width * percent),
      height : Math.ceil(img.height * percent)
    };
  }
  computePegs() {
    var rect;
    var size = 1000;
    rect = (aspectRatio = this.hiddenCanvas.width / this.hiddenCanvas.height) > 1 ? {
      width : size,
      height : Math.round(size / aspectRatio)
    } : {
      width : Math.round(size * aspectRatio),
      height : size
    };
    var shape = Parameters.shape;
    var pegsCount = Parameters.pegsCount;
    var pegs = [];
    if (shape === EShape.RECTANGLE) {
      this.arePegsTooClose = function(a, b) {
        return a.x === b.x || a.y === b.y;
      };
      var w = rect.width;
      var h = rect.height;
      var aspectRatio = h / w;
      var numPegsWide = Math.round(0.5 * pegsCount / (1 + aspectRatio));
      var numPegsHigh = Math.round(0.5 * (pegsCount - 2 * numPegsWide));
      pegs.push({
        x : 0,
        y : 0
      });
      var i = 1;
      for (;i < numPegsWide;i++) {
        pegs.push({
          x : w * (i / numPegsWide),
          y : 0
        });
      }
      pegs.push({
        x : w,
        y : 0
      });
      var j = 1;
      for (;j < numPegsHigh;j++) {
        pegs.push({
          x : w,
          y : h * (j / numPegsHigh)
        });
      }
      pegs.push({
        x : w,
        y : h
      });
      i = numPegsWide - 1;
      for (;i >= 1;i--) {
        pegs.push({
          x : w * (i / numPegsWide),
          y : h
        });
      }
      pegs.push({
        x : 0,
        y : h
      });
      j = numPegsHigh - 1;
      for (;j >= 1;j--) {
        pegs.push({
          x : 0,
          y : h * (j / numPegsHigh)
        });
      }
    } else {
      this.arePegsTooClose = function(peg1, peg2) {
        var diff = Math.abs(peg1.angle - peg2.angle);
        return Math.min(diff, TWO_PI - diff) <= TWO_PI / 16; // numPegsWide ??
      };
      var radiusX = 0.5 * rect.width;
      var radiusY = 0.5 * rect.height;
      var angleDelta = Math.PI * (3 * (radiusX + radiusY) - Math.sqrt((3 * radiusX + radiusY) * (radiusX + 3 * radiusY))) / pegsCount;
      var angle = 0;
      for (;pegs.length < pegsCount;) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var peg = {
          x : radiusX * (1 + cos),
          y : radiusY * (1 + sin),
          angle : angle
        };
        pegs.push(peg);
        angle += angleDelta / Math.sqrt(radiusX * radiusX * sin * sin + radiusY * radiusY * cos * cos);
      }
    }
    var i = 0;
    var pegObjs = pegs;
    for (;i < pegObjs.length;i++) {
      (peg = pegObjs[i]).x *= this.hiddenCanvas.width / rect.width;
      peg.y *= this.hiddenCanvas.height / rect.height;
    }
    return pegs;
  }
}