const { readFileAsync, writeFileAsync } = require("../utils/promislize");

module.exports = class DataStorage {
  constructor(dataFile) {
    this._dataFile = dataFile;
  }

  async exists(data) {
    const content = await readFileAsync(this._dataFile);
    if (content) {
      return content.split(";;\n").includes(data);
    }
    return false;
  }

  async save(data) {
    const content = await readFileAsync(this._dataFile);
    const newContent = [content || ""].push(data).join(";;\n");
    await writeFileAsync(this._dataFile, newContent);
  }
}
