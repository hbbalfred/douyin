const fs = require("fs");
const path = require("path");
const sys = require("../modules/sys");

// Command line arguments
const argv = require("yargs")
  .option("dir", {
    alias: "d",
    description: "The directory of files",
    demandOption: true,
  })
  .option("orderListFile", {
    alias: "l",
    description: "The file of order list",
    demandOption: true,
  })
  .option("extension", {
    description: "The extension name of file",
    default: ".mp4",
  })
  .help()
  .argv;


const SOURCE_DIR = path.resolve(sys.baseDir(), argv.dir);
const ORDER_FILE = path.resolve(sys.baseDir(), argv.orderListFile);

const lines = fs.readFileSync(ORDER_FILE, { encoding: "utf8" }).trim().split("\n").map(line => line.trim());

const leadZero = new Array(lines.length).fill("0", 0, lines.length).join("");

fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter(file => file.isFile() && file.name.endsWith(argv.extension))
  .map(file => {
    const idx = lines.indexOf(file.name);
    sys.assert(idx !== -1, "Not found file inthe order list:", file.name);
    return { idx, name: file.name };
  })
  .forEach(file => {
    const lead = (leadZero + (file.idx + 1)).substr(-3);

    fs.renameSync(path.join(SOURCE_DIR, file.name), path.join(SOURCE_DIR, `${lead} ${file.name}`));
  });
