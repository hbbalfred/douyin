const path = require("path");
const sys = require("../../modules/sys");
const ffmpeg = require("../../modules/ffmpeg");
const network = require("../../modules/network");
const youtube = require("../../webapp/youtube");

// Command line arguments
const argv = require("yargs")
  .option("idOrUrl", {
    alias: "i",
    describe: "The id or url of YouTube video",
    demandOption: true,
  })
  .option("outDir", {
    alias: "o",
    describe: "The output directory to save assets",
    demandOption: false,
  })
  .option("videoQuality", {
    alias: "v",
    describe: "The quality of video, such as <480p|720p>",
    default: "720p",
  })
  .option("audioSampleRate", {
    alias: "a",
    describe: "The quality of audio, such as <44100|48000>",
    default: "44100",
  })
  .help()
  .argv;

const OUTPUT_DIR = path.resolve(sys.baseDir(), argv.outDir);
const VIDEO_FILE = path.join(OUTPUT_DIR, "video.mp4");
const AUDIO_FILE = path.join(OUTPUT_DIR, "audio.m4a");
const SPLASH_FILE = path.join(OUTPUT_DIR, "splash.jpg");
const FINAL_FILE = path.join(OUTPUT_DIR, "final.mp4");
const INFO_FILE = path.join(OUTPUT_DIR, "info.txt");

main();

async function main() {
  await sys.mkdir(OUTPUT_DIR);

  const videoId = youtube.parseVideoIdByUrl(argv.idOrUrl) || argv.idOrUrl;
  const infoUrl = youtube.makeInfoUrl(videoId);
  const splashUrl = youtube.makeSplashUrl(videoId);

  console.log("Load video info...");
  const rawData = await network.loadData(infoUrl, { proxy: true });
  const info = youtube.parseInfo(rawData);

  const video = info.adaptive_fmts.find(it => it.type.startsWith("video/mp4") && it.quality_label === argv.videoQuality);
  const audio = info.adaptive_fmts.find(it => it.type.startsWith("audio/mp4") && it.audio_sample_rate === argv.audioSampleRate);

  assert(video, `Not found the video that quality is ${argv.videoQuality}`);
  assert(audio, `Not found the audio that sample rate is ${argv.audioSampleRate}`);

  const content = [info.title, info.author, youtube.makeWatchingUrl(videoId)];
  await sys.writeFile(INFO_FILE, content.join("\n"));

  console.log("Start to download splash", splashUrl);
  await network.loadDataTo(splashUrl, SPLASH_FILE, { proxy: true });

  let slogger = sys.singleLineLog();

  console.log("Start to download video", video.url);
  await network.loadDataTo(video.url, VIDEO_FILE, { proxy: true, onProgress: wrapOnProgress(slogger, "Video loading...") });
  slogger.flush();

  console.log("Start to download audio", audio.url);
  await network.loadDataTo(audio.url, AUDIO_FILE, { proxy: true, onProgress: wrapOnProgress(slogger, "Audio loading...") });
  slogger.flush();

  console.log("Merge to final file", FINAL_FILE);
  await ffmpeg.merge(VIDEO_FILE, AUDIO_FILE, FINAL_FILE);
}

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

function wrapOnProgress(logger, label) {
  return function onProgress(loaded, total) {
    const percent = (loaded / total) * 100;
    logger.log(`${label}${percent.toFixed(2)}%`);
  };
}
