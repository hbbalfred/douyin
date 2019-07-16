const fs = require("fs");
const path = require("path");
const moment = require("moment");
const ffmpeg = require("../modules/ffmpeg");
const sys = require("../modules/sys");

// Command line arguments
const argv = require("yargs")
  .option("dir", {
    alias: "d",
    description: "The directory of videos",
    demandOption: true,
  })
  .option("regex", {
    alias: "r",
    description: "The regular expression to extract name",
    demandOption: true,
  })
  .help()
  .argv;

main();

async function main() {
  const VIDEOS_DIR = path.resolve(sys.baseDir(), argv.dir);

  const videos = await sys.readdir(VIDEOS_DIR, { fileExtension: ".mp4" });

  const ost = [];

  for (const file of videos) {
    const info = await ffmpeg.getInfo(path.join(VIDEOS_DIR, file.name));
    const duration = info.duration;
    const filename = file.name;
    ost.push({ filename, duration });
  }

  const re = new RegExp(argv.regex, "i");

  let durationMS = 0;

  const digits = (Math.log10(ost.length) >> 0) + 1;
  const indexZero = new Array(digits).fill("0", 0, digits).join("");

  for (let i = 0; i < ost.length; ++i) {
    const results = re.exec(ost[i].filename);
    sys.assert(results, "Invalid file name:" + ost[i].filename);

    const name = results[1];

    const md = moment.duration(durationMS);
    const h = md.get("hours");
    const m = md.get("minutes");
    const s = md.get("seconds");
    
    durationMS += ost[i].duration * 1000;

    const timestamp = h > 0
      ? `${leadZero(h)}:${leadZero(m)}:${leadZero(s)}`
      : `${leadZero(m)}:${leadZero(s)}`;

    const idx = leadZero(i + 1, indexZero);
    sys.log(`#${idx}.(${timestamp}) ${name}`);
  }
}

function leadZero(x, zero = "00") {
  return (zero + x).substr(-zero.length);
}
