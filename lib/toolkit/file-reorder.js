const fs = require("fs");
const path = require("path");
const sys = require("../modules/sys");

// Command line arguments
const argv = require("yargs")
  .option("dir", {
    alias: "d",
    describe: "The directory of files",
    demandOption: true,
  })
  .option("orderListFile", {
    alias: "l",
    describe: "The file of order list",
    demandOption: true,
  })
  .help()
  .argv;


const SOURCE_DIR = path.resolve(sys.baseDir(), argv.dir);
const ORDER_FILE = path.resolve(sys.baseDir(), argv.orderListFile);

const lines = fs.readFileSync(ORDER_FILE, { encoding: "utf8" }).trim().split("\n").map(line => line.trim());

fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter(file => file.isFile() && file.name.endsWith(".mp4"))
  .forEach(file => {
    const idx = lines.indexOf(file.name);
    if (idx === -1) {
      console.error("Not found file in the order list:", file.name);
      process.exit(1);
    }

    const lead = ("000" + (idx + 1)).substr(-3);

    fs.renameSync(path.join(SOURCE_DIR, file.name), path.join(SOURCE_DIR, `${lead} ${file.name}`));
  });
