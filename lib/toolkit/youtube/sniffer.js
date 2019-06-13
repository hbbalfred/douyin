const { fork } = require("child_process");
const path = require("path");
const _get = require("lodash/get");
const sys = require("../../modules/sys");
const network = require("../../modules/network");
const youtube = require("../../webapp/youtube");

// Command line arguments
const argv = require("yargs")
  .option("listFile", {
    alias: "l",
    description: "The file contains list of youtubers channel",
    demandOption: true,
  })
  .option("storageFile", {
    alias: "s",
    description: "The storage file to save downloaded videos",
    demandOption: true,
  })
  .option("outDir", {
    alias: "d",
    description: "The directory to download video",
    default: "./assets"
  })
  .option("sleepTime", {
    description: "The interval seconds waiting for next sniffing",
    default: 3600 // An hour
  })
  .option("verbose", {
    default: true
  })
  .help()
  .argv;

const OUTPUT_DIR = path.resolve(sys.baseDir(), argv.outDir);
const LIST_FILE = path.resolve(sys.baseDir(), argv.listFile);
const STORAGE_FILE = path.resolve(sys.baseDir(), argv.storageFile);
const DOWNLOAD_SCRIPT = path.join(sys.baseDir(), "lib/toolkit/youtube/download.js");

const storage = {
  async exists(videoId) {
    const content = await sys.readFile(STORAGE_FILE);
    return content.split("\n").includes(videoId);
  },

  async save(videoId) {
    const content = await sys.readFile(STORAGE_FILE);
    const data = [content.trim()].concat(videoId);
    await sys.writeFile(STORAGE_FILE, data.join("\n"));
  },
};

main();

async function main() {
  const content = await sys.readFile(LIST_FILE);

  const channels = content.trim().split("\n");

  for (const url of channels) {
    await sys.wait(1 + Math.random() * 10);
    sniff({ url, sleepTime: argv.sleepTime });
  }
}

async function sniff(options) {
  const { url, sleepTime } = options;

  const pageSource = await network.loadData(url, { proxy: true });
  verbose("Load page source:", url);

  const channelData = youtube.parsePersonalChannel(pageSource);

  const tabs = _get(channelData, "contents.twoColumnBrowseResultsRenderer.tabs", []);
  const channelTab = tabs.find(it => _get(it, "tabRenderer.content")) || {};
  const listContainer = _get(channelTab, "tabRenderer.content.sectionListRenderer.contents", []);
  const gridContainer = _get(listContainer[0], "itemSectionRenderer.contents", []);
  const items = _get(gridContainer[0], "gridRenderer.items", []).map(it => _get(it, "gridVideoRenderer"));

  sys.assert(items.length > 0, "Fail to get videos in page:", url);

  const video = items[0];

  const exists = await storage.exists(video.videoId);
  verbose("Video", video.videoId, exists ? "exists" : "NOT exists");

  if (!exists) {
    const outDir = path.join(OUTPUT_DIR, video.videoId);
    await download(video.videoId, outDir);
    await storage.save(video.videoId);
  }

  verbose("Sleep....", (sleepTime / 60).toFixed(2), "minutes");
  await sys.wait(sleepTime);

  sniff(options);
}

function download(videoId, outDir) {
  return new Promise((resolve, reject) => {
    const sub = fork(DOWNLOAD_SCRIPT, ["-i", videoId, "-d", outDir]);
    sub.on("close", code => code === 0 ? resolve() : reject(code));
  });
}

function verbose(...message) {
  if (argv.verbose) {
    console.log.apply(null, message);
  }
}
