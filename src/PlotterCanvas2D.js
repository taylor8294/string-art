import * as canvas from "./Canvas.js";
import { PlotterBase } from "./PlotterBase.js";

export class PlotterCanvas2D extends PlotterBase {
  constructor() {
    super();
    this.canvas = Page.Canvas.getCanvas();
    this.context = this.canvas.getContext("2d", {
      alpha : false
    });
    this.cssPixel = null !== (this.pixelRatio = window.devicePixelRatio) && void 0 !== this.pixelRatio ? this.pixelRatio : 1;
  }
  resize() {
    var w = Math.floor(this.cssPixel * this.canvas.clientWidth);
    var h = Math.floor(this.cssPixel * this.canvas.clientHeight);
    if (!(this.canvas.width === w && this.canvas.height === h)) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }
  initialize(data) {
    this.context.fillStyle = data.backgroundColor;
    this.context.lineJoin = "round";
    canvas.resetCanvasCompositing(this.context);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  finalize() {
  }
  get blur() {
    return this.canvas.style.filter;
  }
  set blur(radius) {
    if (0 === radius) {
      this.canvas.style.filter = "";
    } else {
      this.canvas.style.filter = "blur(".concat(radius, "px)");
      this.canvas.style.filter = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a' x='0' y='0' width='1' height='1'%3E%3CfeGaussianBlur stdDeviation='".concat(radius, "' result='b'/%3E%3CfeMorphology operator='dilate' radius='").concat(radius, "'/%3E %3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='b'/%3E%3C/feMerge%3E%3C/filter%3E%3C/svg%3E#a\")");
    }
  }
  drawLines(data, conditional, dest, deepDataAndEvents, lineWidth) {
    if (data.length >= 1) {
      canvas.applyCanvasCompositing(this.context, conditional, dest, deepDataAndEvents);
      this.context.lineWidth = lineWidth * this.cssPixel;
      var i = 0;
      var resultItems = data;
      for (;i < resultItems.length;i++) {
        var result = resultItems[i];
        this.context.beginPath();
        this.context.moveTo(result.from.x * this.cssPixel, result.from.y * this.cssPixel);
        this.context.lineTo(result.to.x * this.cssPixel, result.to.y * this.cssPixel);
        this.context.stroke();
        this.context.closePath();
      }
      canvas.resetCanvasCompositing(this.context);
    }
  }
  drawPoints(points, color, keepData) {
    if (points.length > 0) {
      this.context.fillStyle = color;
      this.context.strokeStyle = "none";
      var i = 0;
      var resultItems = points;
      for (;i < resultItems.length;i++) {
        var result = resultItems[i];
        this.context.beginPath();
        this.context.arc(result.x * this.cssPixel, result.y * this.cssPixel, 0.5 * keepData * this.cssPixel, 0, 2 * Math.PI);
        this.context.fill();
        this.context.closePath();
      }
    }
  }
  get size() {
    return{
      width : Math.floor(this.canvas.width / this.cssPixel),
      height : Math.floor(this.canvas.height / this.cssPixel)
    };
  }
}