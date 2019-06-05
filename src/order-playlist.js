const fs = require("fs");
const path = require("path");
const CONST = require("./utils/constants");
const parsePlayList = require("./components/playlist-parser");

// Command line arguments
const argv = require("yargs")
  .option("dir", {
    alias: "d",
    describe: "The directory of videos",
    demandOption: true,
  })
  .option("playlist", {
    alias: "l",
    describe: "The file of play list",
    demandOption: true,
  })
  .help()
  .argv;


const VIDEOS_DIR = path.join(CONST.PWD, argv.dir);
const PLAYLIST_FILE = path.join(CONST.PWD, argv.playlist);

const playList = parsePlayList(PLAYLIST_FILE);

fs.readdirSync(VIDEOS_DIR, { withFileTypes: true })
  .filter(file => file.isFile() && file.name.endsWith(".mp4"))
  .forEach(file => {
    const fileName = file.name.substr(0, file.name.length - 4);
    const idx = playList.findIndex(it => it.name === fileName);
    if (idx === -1) {
      console.error("No file name:", fileName);
      process.exit(1);
      return;
    }

    const lead = ("000" + (idx + 1)).substr(-3);

    fs.renameSync(path.join(VIDEOS_DIR, file.name), path.join(VIDEOS_DIR, `${lead} ${file.name}`));
  });

console.log("Done");
