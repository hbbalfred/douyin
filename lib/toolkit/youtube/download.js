const path = require("path");
const moment = require("moment");
const sys = require("../../modules/sys");
const ffmpeg = require("../../modules/ffmpeg");
const network = require("../../modules/network");
const youtube = require("../../webapp/youtube");

// Command line arguments
const argv = require("yargs")
  .option("idOrUrl", {
    alias: "i",
    type: "string",
    description: "The id or url of YouTube video",
    demandOption: true,
  })
  .option("outDir", {
    alias: "d",
    type: "string",
    description: "The output directory to save assets",
    demandOption: true,
  })
  .option("only", {
    type: "string",
    description: "Choose loading assets <info,thumbnail,video,audio>",
  })
  .option("quality", {
    type: "string",
    description: "The quality of video <1080p,720p,480p,360p,240p,144p>",
    default: "720p",
  })
  .option("sampleRate", {
    type: "string",
    description: "The quality of audio <48000,44100>",
    default: "44100",
  })
  .option("resolution", {
    type: "string",
    description: "The resolution of thumbnail <maxres,hq,mq,sd>",
    default: "maxres",
  })
  .option("image", {
    type: "string",
    description: "The image of thumbnail <default,1,2,3>",
    default: "default",
  })
  .option("verbose", {
    default: true
  })
  .help()
  .argv;

const OUTPUT_DIR = path.resolve(sys.baseDir(), argv.outDir);
const VIDEO_FILE = path.join(OUTPUT_DIR, "video.mp4");
const AUDIO_FILE = path.join(OUTPUT_DIR, "audio.m4a");
const INFO_FILE = path.join(OUTPUT_DIR, "info.txt");
const FINAL_FILE = path.join(OUTPUT_DIR, "final.mp4");

main();

async function main() {
  sys.assert(argv.idOrUrl, "Invalid id or url, may be special symbols in the argument.");

  await sys.mkdir(OUTPUT_DIR);

  const videoId = youtube.parseVideoIdByUrl(argv.idOrUrl) || argv.idOrUrl;
  const infoUrl = youtube.makeInfoUrl(videoId);
  const watchingUrl = youtube.makeWatchingUrl(videoId);

  verbose(`[${videoId}]`, "Load video info...");
  const rawData = await network.loadData(infoUrl, { proxy: true });
  const info = youtube.parseVideoInfo(rawData);

  if (!info.adaptive_fmts) {
    verbose(`[${videoId}]`, "Load page source since `adaptive_fmts` not found in video info");
    const pageSource = await network.loadData(watchingUrl, { proxy: true });
    info.adaptive_fmts = youtube.extractAdaptiveFmts(pageSource);

    if (!(
      info.adaptive_fmts &&
      Array.isArray(info.adaptive_fmts) &&
      typeof info.adaptive_fmts[0].type === "string"
    )) {
      verbose(`[${videoId}]`, "Invalid data, please check the dump file:", OUTPUT_DIR);
      return sys.writeFile(path.join(OUTPUT_DIR, "dump"), pageSource);
    }
  }

  if (!argv.only || argv.only.includes("info")) {
    const content = [info.title, info.author, watchingUrl];
    await sys.writeFile(INFO_FILE, content.join("\n"));  
  }

  if (!argv.only || argv.only.includes("thumbnail")) {
    verbose("Thumbnail downloading start");
    await downloadThumbnail(videoId, argv.resolution, argv.image);
  }
  
  if (!argv.only || argv.only.includes("video")) {
    verbose("Video downloading start");
    await downloadVideo(info.adaptive_fmts);  
    verbose("Complete video download");
  }

  if (!argv.only || argv.only.includes("audio")) {
    verbose("Audio downloading start");
    await downloadAudio(info.adaptive_fmts);  
    verbose("Complete audio download");
  }

  if (!argv.only || (argv.only.includes("video") && argv.only.includes("audio"))) {
    verbose("Merge to final file:", OUTPUT_DIR);
    await ffmpeg.merge(VIDEO_FILE, AUDIO_FILE, FINAL_FILE);  
  }
}

async function downloadThumbnail(videoId, resolution, image) {
  const url = youtube.makeThumbnailUrl(videoId, resolution, image);
  const dest = path.join(OUTPUT_DIR, path.basename(url));
  await network.loadDataTo(url, dest, { proxy: true });
}

async function downloadVideo(adaptive_fmts) {
  const video = adaptive_fmts.find(it => it.type.startsWith("video/mp4") && it.quality_label === argv.quality);
  sys.assert(video, `Not found the video that quality is ${argv.videoQuality}`);

  const logger = sys.singleLineLog();
  await network.loadDataTo(video.url, VIDEO_FILE, { proxy: true, onProgress: wrapOnProgress(logger, "Video loading") });
  logger.flush();
}

async function downloadAudio(adaptive_fmts) {
  const audioSampleRate = parseInt(argv.sampleRate, 10);
  const audio = adaptive_fmts.find(it => it.type.startsWith("audio/mp4") && parseInt(it.audio_sample_rate, 10) === audioSampleRate);
  sys.assert(audio, `Not found the audio that sample rate is ${argv.audioSampleRate}`);

  const logger = sys.singleLineLog();
  await network.loadDataTo(audio.url, AUDIO_FILE, { proxy: true, onProgress: wrapOnProgress(logger, "Audio loading") });
  logger.flush();
}

function wrapOnProgress(logger, label) {
  const timer = Date.now();
  return function onProgress(loaded, total) {
    const dt = Date.now() - timer;
    const speed = loaded / dt;
    const time = (total - loaded) / speed;
    const kbs = speed * (1000 / 1024);
    const percent = (loaded / total) * 100;
    const remain = moment.duration(time).as("minutes");
    logger.log(`${label} Percent ${percent.toFixed(2)}% - Speed ${kbs.toFixed(2)}KB/s - Remain ${remain.toFixed(2)} minutes`);
  };
}

function verbose(...messages) {
  if (argv.verbose) {
    Reflect.apply(sys.log, sys, messages);
  }
}