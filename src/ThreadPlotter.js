import { Parameters } from "./Parameters.js";
export class ThreadPlotter {
  constructor(plotter, computer) {
    this.plotter = plotter;
    this.threadComputer = computer;
    this.nbSegmentsDrawn = 0;
  }
  reset() {
    this.nbSegmentsDrawn = 0;
  }
  plot() {
    if (this.nbSegmentsDrawn !== this.threadComputer.nbSegments) {
      if (this.nbSegmentsDrawn > this.threadComputer.nbSegments && (this.nbSegmentsDrawn = 0), 0 === this.nbSegmentsDrawn) {
        var options = {
          backgroundColor : Parameters.invertColors ? "black" : "white",
          blur : Parameters.blur
        };
        this.plotter.resize();
        this.plotter.initialize(options);
        if (Parameters.displayPegs) {
          this.threadComputer.drawPegs(this.plotter);
        }
        this.threadComputer.drawThread(this.plotter, 0);
        this.plotter.finalize();
      } else {
        this.threadComputer.drawThread(this.plotter, this.nbSegmentsDrawn);
      }
      this.nbSegmentsDrawn = this.threadComputer.nbSegments;
    }
  }
}