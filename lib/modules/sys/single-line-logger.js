/**
 * @see http://www.termsys.demon.co.uk/vtansi.htm#cursor
 */
module.exports = class SingleLineLogger {
  constructor() {
    this._started = false;
  }

  log(message) {
    if (this._started) {
      process.stdout.write("\u001b[2K");
      process.stdout.write("\u001b[u");
    }
    process.stdout.write(message);
    process.stdout.write("\u001b[s");
    this._started = true;
  }

  end(mod = "newline") {
    if (mod === "newline") {
      process.stdout.write("\n");
    }
    else if (mod === "clean") {
      process.stdout.write("\u001b[2K");
      process.stdout.write("\u001b[u");
    }
  }
}
