
import * as webUtils from "./webUtils.js";
import { Parameters } from "./Parameters.js";
import { PlotterCanvas2D } from "./PlotterCanvas2D.js";
import { PlotterSVG } from "./PlotterSvg.js";
import { ThreadComputer } from "./ThreadComputer.js";
import { ThreadPlotter } from "./ThreadPlotter.js";

function inIframe() {
    var self = window;
    try {
        if (self.self !== self.top || self.location !== self.parent.location) {
            return true;
        }
    } catch (e) {
        return true;
    }
    return false;
}

if (!inIframe()) {
    webUtils.declarePolyfills();
    var canvas = new PlotterCanvas2D();
    var plotter = null;
    var computer = null;
    var shouldReset = true;
    
    Page.Canvas.showLoader(true);

    Parameters.addRedrawObserver(function() {
        if (!(null == plotter)) {
            plotter.reset();
        }
    });
    Parameters.addResetObserver(function() {
        shouldReset = true;
    });
    
    function blur(radius) {
        canvas.blur = radius;
    }
    Parameters.addBlurChangeObserver(blur);
    blur(Parameters.blur);

    Parameters.addDownloadObserver(function() {
        var plotterSvg = new PlotterSVG();
        (new ThreadPlotter(plotterSvg, computer)).plot();
        var svg = plotterSvg.export();
        webUtils.downloadTextFile(svg, "string-art.svg");
    });
    Parameters.addDownloadInstructionsObserver(function() {
        var instructions = computer.instructions;
        webUtils.downloadTextFile(instructions, "string-art_instructions.txt");
    });


    function onFrame() {
        if (shouldReset) {
            computer.reset(Parameters.linesOpacity, Parameters.linesThickness);
            plotter.reset();
            plotter.plotter.resize();
            shouldReset = false;
        }
        if (computer.computeNextSegments(20)) {
            if (Parameters.showIndicators) {
                computer.updateIndicators(Page.Canvas.setIndicatorText);
            }
        }
        if (Parameters.debug) computer.drawDebugView(canvas.context);
        else plotter.plot();
        requestAnimationFrame(onFrame);
    }
    function onLoad(img) {
        Page.Canvas.showLoader(false);
        computer = new ThreadComputer(img);
        plotter = new ThreadPlotter(canvas, computer);
        shouldReset = true;
    }
    Parameters.addFileUploadObserver(onLoad);
    var img = new Image;
    img.addEventListener("load", function() {
        onLoad(img);
        requestAnimationFrame(onFrame);
    });
    img.src = "./resources/face.jpg";
}
