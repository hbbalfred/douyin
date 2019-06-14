const path = require("path");
const sys = require("../../modules/sys");
const ffmpeg = require("../../modules/ffmpeg");
const network = require("../../modules/network");
const youtube = require("../../webapp/youtube");

// Command line arguments
const argv = require("yargs")
  .option("idOrUrl", {
    alias: "i",
    description: "The id or url of YouTube video",
    demandOption: true,
  })
  .option("outDir", {
    alias: "d",
    description: "The output directory to save assets",
    demandOption: true,
  })
  .option("videoQuality", {
    alias: "v",
    description: "The quality of video",
    default: "720p",
  })
  .option("audioSampleRate", {
    alias: "a",
    description: "The quality of audio",
    default: "44100",
    type: "string"
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
  await sys.mkdir(OUTPUT_DIR);

  const videoId = youtube.parseVideoIdByUrl(argv.idOrUrl) || argv.idOrUrl;
  const infoUrl = youtube.makeInfoUrl(videoId);

  console.log("Load video info...");
  const rawData = await network.loadData(infoUrl, { proxy: true });
  const info = youtube.parseVideoInfo(rawData);

  const video = info.adaptive_fmts.find(it => it.type.startsWith("video/mp4") && it.quality_label === argv.videoQuality);
  const audio = info.adaptive_fmts.find(it => it.type.startsWith("audio/mp4") && it.audio_sample_rate === argv.audioSampleRate);

  sys.assert(video, `Not found the video that quality is ${argv.videoQuality}`);
  sys.assert(audio, `Not found the audio that sample rate is ${argv.audioSampleRate}`);

  const content = [info.title, info.author, youtube.makeWatchingUrl(videoId)];
  await sys.writeFile(INFO_FILE, content.join("\n"));

  console.log("Start to download thumbnail");
  await downloadThumbnail(videoId, "maxres");
  await downloadThumbnail(videoId, "hq");

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

function wrapOnProgress(logger, label) {
  return function onProgress(loaded, total) {
    const percent = (loaded / total) * 100;
    logger.log(`${label}${percent.toFixed(2)}%`);
  };
}

async function downloadThumbnail(videoId, resolution) {
  const url = youtube.makeThumbnailUrl(videoId, resolution);
  const dest = path.join(OUTPUT_DIR, path.basename(url));
  await network.loadDataTo(url, dest, { proxy: true });
}