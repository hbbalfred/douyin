/**
 * @see http://www.termsys.demon.co.uk/vtansi.htm#cursor
 */
module.exports = class SingleLineLogger {
  constructor() {
    this._started = false;
  }

  log(message) {
    if (this._started) {
      this.flush();
    }
    process.stdout.write("\u001b[s");
    process.stdout.write(message);
    this._started = true;
  }
	
  flush() {
    process.stdout.write("\u001b[2K");
    process.stdout.write("\u001b[u");
    this._started = false;
  }

  end() {
    process.stdout.write("\n");
    this._started = false;
  }
};
