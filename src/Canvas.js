var compositingOperation = {
  DARKEN : 0,
  LIGHTEN : 1,
  0: "DARKEN",
  1: "LIGHTEN"
};
export { compositingOperation as ECompositingOperation };
var color = {
  MONOCHROME : 0,
  RED : 1,
  GREEN : 2,
  BLUE : 3,
  0: "MONOCHROME",
  1: "RED",
  2: "GREEN",
  3: "BLUE"
};
export { color as EColor };

var _useAdvancedCompositing = true;
export function useAdvancedCompositing() {
  return _useAdvancedCompositing;
};
export function computeRawColor(col) {
  return col === color.MONOCHROME ? {
    r : 1,
    g : 1,
    b : 1
  } : {
    r : col === color.RED ? 1 : 0,
    g : col === color.GREEN ? 1 : 0,
    b : col === color.BLUE ? 1 : 0
  };
}
export function resetCanvasCompositing(ctx) {
  ctx.globalCompositeOperation = "source-over";
}
export function applyCanvasCompositing(ctx, col, opacity, operation) {
  var rgb = computeRawColor(col);
  if (_useAdvancedCompositing) {
    var op = operation === compositingOperation.LIGHTEN ? "lighter" : "difference";
    if (ctx.globalCompositeOperation = op, ctx.globalCompositeOperation === op) {
      var val = Math.ceil(255 * opacity);
      return void(ctx.strokeStyle = "rgb(".concat(rgb.r * val, ", ").concat(rgb.g * val, ", ").concat(rgb.b * val, ")"));
    }
    _useAdvancedCompositing = false;
    Page.Demopage.setErrorMessage("advanced-compositing-not-supported", "Your browser does not support canvas2D compositing '".concat(op, "'. The project will not run as expected."));
  }
  resetCanvasCompositing(ctx);
  if (operation === compositingOperation.DARKEN) {
    rgb.r = 1 - rgb.r;
    rgb.g = 1 - rgb.g;
    rgb.b = 1 - rgb.b;
  }
  ctx.strokeStyle = "rgba(".concat(255 * rgb.r, ", ").concat(255 * rgb.g, ", ").concat(255 * rgb.b, ", ").concat(opacity, ")");
};