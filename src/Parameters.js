import * as webUtils from "./webUtils.js";

var shape = {
  RECTANGLE: "0",
  ELLIPSE: "1",
  0: "RECTANGLE",
  1: "ELLIPSE"
};
var mode = {
  MONOCHROME: "0",
  COLORS: "1",
  0: "MONOCHROME",
  1: "COLORS"
};
var shapeTab = "shape-tabs-id";
var pegsRange = "pegs-range-id";
var qualityTab = "quality-tabs-id";
var threadModeTab = "thread-mode-tabs-id";
var opacityRange = "opacity-range-id";
var thicknessRange = "thickness-range-id";
var pegsCheckbox = "display-pegs-checkbox-id";
var invertCheckbox = "invert-colors-checkbox-id";
var indicatorsCheckbox = "show-indicators-checkbox-id";
var blurRange = "blur-range-id";
var debugCheckbox = "debug-checkbox-id";
var instructionsDownload = "instructions-download-id";

function redrawObserver() {
  var i = 0;
  var fns = redrawObservers;
  for (;i < fns.length;i++) {
    (0, fns[i])();
  }
}
function resetObserver() {
  var i = 0;
  var fns = resetObservers;
  for (;i < fns.length;i++) {
    (0, fns[i])();
  }
}

var redrawObservers = [];
var resetObservers = [];
Page.Tabs.addObserver(shapeTab, resetObserver);
Page.Range.addLazyObserver(pegsRange, resetObserver);
Page.Tabs.addObserver(qualityTab, resetObserver);
Page.Tabs.addObserver(threadModeTab, resetObserver);
Page.Range.addLazyObserver(opacityRange, resetObserver);
Page.Range.addLazyObserver(thicknessRange, resetObserver);
Page.Checkbox.addObserver(pegsCheckbox, redrawObserver);
Page.Checkbox.addObserver(invertCheckbox, resetObserver);
Page.Checkbox.addObserver(debugCheckbox, redrawObserver);
Page.Canvas.Observers.canvasResize.push(redrawObserver);

var isDebug = false;
function checkDebugVisibility() {
  var isChecked = Page.Checkbox.isChecked(debugCheckbox);
  if (isChecked) {
    isDebug = true;
  } else {
    isDebug = "1" === webUtils.getQueryStringValue("debug");
    if (isDebug) {
      Page.Checkbox.setChecked(debugCheckbox, true);
      isChecked = true;
    }
  }
  Page.Canvas.setIndicatorVisibility("error-average", isChecked);
  Page.Canvas.setIndicatorVisibility("error-mean-square", isChecked);
  Page.Canvas.setIndicatorVisibility("error-variance", isChecked);
}
Page.Checkbox.addObserver(debugCheckbox, checkDebugVisibility);
checkDebugVisibility();

function checkIndicatorsVisibility() {
  var isChecked = Page.Checkbox.isChecked(indicatorsCheckbox);
  Page.Canvas.setIndicatorsVisibility(isChecked);
}
Page.Checkbox.addObserver(indicatorsCheckbox, checkIndicatorsVisibility);
checkIndicatorsVisibility();

class Parameters {
  constructor() {}
  addFileUploadObserver(callback) {
    Page.FileControl.addUploadObserver("input-image-upload-button", function(files) {
      if (1 === files.length) {
        Page.Canvas.showLoader(true);
        var reader = new FileReader;
        reader.onload = function() {
          var image = new Image;
          image.addEventListener("load", function() {
            callback(image);
          });
          image.src = reader.result;
        };
        reader.readAsDataURL(files[0]);
      }
    });
  }
  get debug() {
    return isDebug;
  }
  get shape() {
    return Page.Tabs.getValues(shapeTab)[0];
  }
  get pegsCount() {
    return Page.Range.getValue(pegsRange);
  }
  get quality() {
    return Page.Tabs.getValues(qualityTab)[0];
  }
  get mode() {
    return Page.Tabs.getValues(threadModeTab)[0];
  }
  get nbLines() {
    return Page.Range.getValue("lines-range-id");
  }
  get linesOpacity() {
    var opacity = Page.Range.getValue(opacityRange);
    return Math.pow(2, opacity - 7);
  }
  get linesThickness() {
    return Page.Range.getValue(thicknessRange);
  }
  get displayPegs() {
    return Page.Checkbox.isChecked(pegsCheckbox);
  }
  get invertColors() {
    return Page.Checkbox.isChecked(invertCheckbox);
  }
  get showIndicators() {
    return Page.Checkbox.isChecked(indicatorsCheckbox);
  }
  get blur() {
    return Page.Range.getValue(blurRange);
  }
  addRedrawObserver(callback) {
    redrawObservers.push(callback);
  }
  addResetObserver(callback) {
    resetObservers.push(callback);
  }
  addBlurChangeObserver(callback) {
    Page.Range.addObserver(blurRange, callback);
  }
  addDownloadObserver(callback) {
    Page.FileControl.addDownloadObserver("result-download-id", callback);
  }
  addDownloadInstructionsObserver(callback) {
    Page.FileControl.addDownloadObserver(instructionsDownload, callback);
  }
}
var params = new Parameters();

function checkDownloadVisibility() {
  var isMono = params.mode === mode.MONOCHROME;
  var notInvert = !params.invertColors;
  Page.Controls.setVisibility(instructionsDownload, isMono && notInvert);
}
Page.Tabs.addObserver(threadModeTab, checkDownloadVisibility);
Page.Checkbox.addObserver(invertCheckbox, checkDownloadVisibility);
checkDownloadVisibility();

export { params as Parameters, shape as EShape, mode as EMode };