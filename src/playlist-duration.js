const path = require("path");
const moment = require("moment");
const CONST = require("./utils/constants");
const parsePlayList = require("./components/playlist-parser");

// Command line arguments
const argv = require("yargs")
  .option("playlist", {
    alias: "l",
    describe: "The file of play list",
    demandOption: true,
  })
  .help()
  .argv;

main();

function main() {
  
  const PLAYLIST_FILE = path.join(CONST.PWD, argv.playlist);
  const playList = parsePlayList(PLAYLIST_FILE);
  
  let duration = moment.duration(0);
  for (let i = 0; i < playList.length; ++i) {
    const idx = leadZero(i + 1);
    const name = playList[i].name;

    const h = duration.get('hours');
    const m = duration.get('minutes');
    const s = duration.get('seconds');
    const hms = fillDuration(playList[i].duration);
    if (!hms) {
      console.error("Invalid duration:", playList[i].name, playList[i].duration);
      process.exit(1);
      return;
    }
    duration = duration.add(moment.duration(hms));

    const time = h > 0
      ? `${leadZero(h)}:${leadZero(m)}:${leadZero(s)}`
      : `${leadZero(m)}:${leadZero(s)}`;

    console.log(`#${idx}.(${time}) ${name}`);
  }
}

function leadZero(x) {
  return ('0' + x).substr(-2);
}

function fillDuration(duration) {
  if (typeof duration === "string") {
    const hms = duration.split(":");
    if (hms.length === 0) {
      return;
    }
    if (hms.length === 1) {
      return `00:00:${leadZero(hms[0])}`;
    }
    if (hms.length === 2) {
      return `00:${leadZero(hms[0])}:${leadZero(hms[1])}`;
    }
    return `${leadZero(hms[0])}:${leadZero(hms[1])}:${leadZero(hms[2])}`;
  }
}