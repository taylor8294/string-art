export class PlotterBase {
  drawBrokenLine(coords, color, lineOpacity, operation, strokeWidth) {
    var lines = [];
    var i = 0;
    for (;i < coords.length - 1;i++) {
      lines.push({
        from : coords[i],
        to : coords[i + 1]
      });
    }
    this.drawLines(lines, color, lineOpacity, operation, strokeWidth);
  }
}
