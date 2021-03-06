const path = require("path");
const mkdirp = require("mkdirp");
const ffmpeg = require("../modules/ffmpeg");
const ds = require("../modules/ds");
const sys = require("../modules/sys");

// Command line arguments
const argv = require("yargs")
  .option("dir", {
    alias: "d",
    description: "The directory of videos",
    demandOption: true,
  })
  .option("outDir", {
    "alias": "o",
    description: "The directory of destination",
    demandOption: true,
  })
  .option("verbose", {
    description: "Whether print verbose info",
    default: true,
  })
  .help()
  .argv;

const VIDEO_DIR = path.resolve(sys.baseDir(), argv.dir);
const OUTPUT_DIR = path.resolve(sys.baseDir(), argv.outDir);
const VIDEO_LIST_FILE = path.join(OUTPUT_DIR, "video-list");
const FINAL_VIDEO_FILE = path.join(OUTPUT_DIR, "final.mp4");

main();

async function main() {
  await mkdirp(OUTPUT_DIR);

  let videoList = await sys.readdir(VIDEO_DIR, { fileExtension: ".mp4" });

  videoList = videoList.map(file => ({
    name: file.name,
    src: path.join(VIDEO_DIR, file.name),
    dst: path.join(OUTPUT_DIR, file.name).replace(/'/g, "_"),
  }));

  const info = await stats(videoList);
  verbose("Total videos:", videoList.length);
  verbose(`Compress info: ${info.width}x${info.height}, fsp=${info.fps}, bit_rate=${info.bit_rate}`);

  let timers = []; // seconds

  for (let i = 0, n = videoList.length; i < n; ++i) {
    let timer = process.hrtime();

    await preprocess(videoList[i], info);

    timer = process.hrtime(timer);
    timers.push(timer[0]);
    verbose(
      "Used", timer[0], "seconds.",
      "Remain", (n - i - 1), "video(s),",
      "estimate", (ds.average(timers) * (n - i - 1) / 60).toFixed(2), "minutes"
    );
  }

  const videoListContent = videoList.map(file => `file '${file.dst}'`).join("\n");
  await sys.writeFile(VIDEO_LIST_FILE, videoListContent);
  verbose(`Generate video list file: ${VIDEO_LIST_FILE}`);

  await ffmpeg.concat(VIDEO_LIST_FILE, FINAL_VIDEO_FILE);
  verbose(`Final video: ${FINAL_VIDEO_FILE}`);
}

async function preprocess(video, options) {
  const info = await ffmpeg.getInfo(video.src);

  let sourcePath = video.src;

  if (info.width !== options.width || info.height !== options.height) {
    const tmpPath = path.join(OUTPUT_DIR, `tmp_${video.name}`);
    verbose(`Pad video to: ${tmpPath}`);
    await ffmpeg.pad(video.src, tmpPath, options);
    sourcePath = tmpPath;
  }

  verbose(`Convert video to: ${video.dst}`);
  await ffmpeg.convert(sourcePath, video.dst, options);
}

async function stats(videoList) {
  let fps = 0;
  let bit_rate = 0;
  const sizeMap = {};

  for (const video of videoList) {
    const info = await ffmpeg.getInfo(video.src);
    
    if (info.fps > fps) {
      fps = info.fps;
    }

    if (info.bit_rate > bit_rate) {
      bit_rate = info.bit_rate;
    }

    const size = `${info.width}x${info.height}`;
    if (!sizeMap[size]) {
      sizeMap[size] = 0;
    }
    ++sizeMap[size];
  }

  const orderSize = Object.keys(sizeMap)
    .map(size => ({ size, count: sizeMap[size] }))
    .sort((a, b) => b.count - a.count);

  const maxSize = orderSize[0].size;
  let [width, height] = [...maxSize.split("x")];
  width = parseInt(width, 10);
  height = parseInt(height, 10);

  const rval = { bit_rate, fps, width, height };

  if (process.env.STA_BITRATE) {
    rval.bit_rate = parseFloat(process.env.STA_BITRATE);
  }
  if (process.env.STA_FPS) {
    rval.fps = parseFloat(process.env.STA_FPS);
  }
  if (process.env.STA_WIDTH) {
    rval.width = parseInt(process.env.STA_WIDTH, 10);
  }
  if (process.env.STA_HEIGHT) {
    rval.height = parseInt(process.env.STA_HEIGHT, 10);
  }

  return rval;
}

function verbose(...messages) {
  if (argv.verbose) {
    Reflect.apply(sys.log, sys, messages);
  }
}
