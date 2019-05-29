const fs = require('fs');
const path = require('path');
const moment = require('moment');
const ffmpeg = require("./components/ffmpeg");

const CONST = require("./utils/constants");

// Command line arguments
const argv = require("yargs")
  .option("dir", {
    alias: "d",
    describe: "The directory of videos",
    demandOption: true,
  })
  .option("regex", {
    alias: "r",
    describe: "The regular expression to extract name",
    demandOption: true,
  })
  .help()
  .argv;

main();

async function main() {
  const VIDEOS_DIR = path.join(CONST.PWD, argv.dir);

  const files = fs.readdirSync(VIDEOS_DIR, { withFileTypes: true }).filter(file => file.isFile() && file.name.endsWith(".mp4"));

  const ost = [];

  for (const file of files) {
    const duration = await ffmpeg.getDuration(path.join(VIDEOS_DIR, file.name));
    const filename = file.name
    ost.push({ filename, duration });
  }

  const re = new RegExp(argv.regex);

  let duration = moment.duration(0);

  for (let i = 0; i < ost.length; ++i) {
    const idx = leadZero(i + 1);
    const name = re.exec(ost[i].filename)[1];

    let h = duration.get('hours');
    let m = duration.get('minutes');
    let s = duration.get('seconds');
    duration = duration.add(moment.duration(ost[i].duration));

    const time = h > 0
      ? `${leadZero(h)}:${leadZero(m)}:${leadZero(s)}`
      : `${leadZero(m)}:${leadZero(s)}`;

    console.log(`#${idx}.(${time}) ${name}`);
  }
}

function leadZero(x) {
  return ('0' + x).substr(-2);
}

