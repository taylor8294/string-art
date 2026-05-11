export class XMLWriter {
  constructor() {
    this.indentationLevel = 0;
    this.lines = [];
  }
  get result() {
    return this.lines.join("\n");
  }
  startBlock(line) {
    this.addLine(line);
    this.indentationLevel++;
  }
  endBlock(line) {
    this.indentationLevel--;
    this.addLine(line);
  }
  addLine(line) {
    this.lines.push(this.prefix + line);
  }
  get prefix() {
    return "\t".repeat(this.indentationLevel);
  }
}