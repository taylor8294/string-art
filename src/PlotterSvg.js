import * as canvas from "./Canvas.js";
import { PlotterBase } from "./PlotterBase.js";
import { XMLWriter } from "./XmlWriter.js";
var gaussianBlur = "gaussianBlur";

export class PlotterSVG extends PlotterBase {
  constructor() {
    super();
  }
  resize() {
  }
  initialize(options) {
    this.writer = new XMLWriter();
    this.hasBlur = options.blur > 0;
    this.writer.addLine('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
    this.writer.startBlock('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 '.concat(1E3, " ").concat(1E3, '">'));
    if (this.hasBlur) {
      this.writer.startBlock("<defs>");
      this.writer.startBlock('<filter id="'.concat(gaussianBlur, '" x="0" y="0">'));
      this.writer.addLine('<feGaussianBlur in="SourceGraphic" stdDeviation="'.concat(options.blur, '"/>'));
      this.writer.endBlock("</filter>");
      this.writer.endBlock("</defs>");
      this.writer.startBlock('<g filter="url(#'.concat(gaussianBlur, ')">'));
    }
    this.writer.addLine('<rect fill="white" stroke="none" x="'.concat(-10, '" y="').concat(-10, '" width="').concat(1020, '" height="').concat(1020, '"/>'));
  }
  finalize() {
    if (this.hasBlur) {
      this.writer.endBlock("</g>");
    }
    this.writer.endBlock("</svg>");
  }
  drawLines(lines, color, lineOpacity, operation, strokeWidth) {
    if (lines.length >= 1) {
      var col = void 0;
      if ((0, canvas.useAdvancedCompositing)()) {
        this.writer.startBlock("<defs>");
        this.writer.startBlock('<style type="text/css">');
        this.writer.startBlock("<![CDATA[");
        this.writer.addLine("line { mix-blend-mode: difference; }");
        if (operation === canvas.ECompositingOperation.LIGHTEN) {
          this.writer.addLine("svg { filter: invert(1); background: black; }");
        }
        this.writer.endBlock("]]\x3e");
        this.writer.endBlock("</style>");
        this.writer.endBlock("</defs>");
        var amt = Math.ceil(255 * lineOpacity);
        var rgba = (0, canvas.computeRawColor)(color);
        col = "rgb(".concat(rgba.r * amt, ", ").concat(rgba.g * amt, ", ").concat(rgba.b * amt, ")");
      } else {
        amt = (0, canvas.useAdvancedCompositing)() ? 255 : 0;
        rgba = (0, canvas.computeRawColor)(color);
        col = "rgba(".concat(rgba.r * amt, ", ").concat(rgba.g * amt, ", ").concat(rgba.b * amt, ", ").concat(lineOpacity, ")");
      }
      this.writer.startBlock('<g stroke="'.concat(col, '" stroke-width="').concat(strokeWidth, '" stroke-linecap="round" fill="none">'));
      var i = 0;
      var lineObjs = lines;
      for (;i < lineObjs.length;i++) {
        var line = lineObjs[i];
        this.writer.addLine('<line x1="'.concat(line.from.x.toFixed(1), '" y1="').concat(line.from.y.toFixed(1), '" x2="').concat(line.to.x.toFixed(1), '" y2="').concat(line.to.y.toFixed(1), '"/>'));
      }
      this.writer.endBlock("</g>");
    }
  }
  drawPoints(points, x, radius) {
    if (points.length > 0) {
      this.writer.startBlock('<g fill="'.concat(x, '" stroke="none">'));
      var i = 0;
      var pointObjs = points;
      for (;i < pointObjs.length;i++) {
        var point = pointObjs[i];
        this.writer.addLine('<circle cx="'.concat(point.x.toFixed(1), '" cy="').concat(point.y.toFixed(1), '" r="').concat(0.5 * radius, '"/>'));
      }
      this.writer.endBlock("</g>");
    }
  }
  export() {
    var now = Date.now();
    var svgString = this.writer.result;
    console.log("Concatenation took ".concat(Date.now() - now, " ms."));
    return svgString;
  }
  get size() {
    return{
      width : 1000,
      height : 1000
    };
  }
}