const { fork } = require("child_process");
const path = require("path");
const _get = require("lodash/get");
const ds = require("../../modules/ds");
const sys = require("../../modules/sys");
const network = require("../../modules/network");
const youtube = require("../../webapp/youtube");

// Command line arguments
const argv = require("yargs")
  .option("idOrUrl", {
    alias: "i",
    type: "string",
    description: "The id or url of the playlist",
    demandOption: true,
  })
  .option("outDir", {
    alias: "d",
    type: "string",
    description: "The output directory to save assets",
    demandOption: true,
  })
  .option("quality", {
    type: "string",
    description: "The quality of video <1080p,720p,480p,360p,240p,144p>",
    default: "480p",
  })
  .option("sampleRate", {
    type: "string",
    description: "The quality of audio <48000,44100>",
    default: "44100",
  })
  .option("verbose", {
    default: true
  })
  .help()
  .argv;

const OUTPUT_DIR = path.resolve(sys.baseDir(), argv.outDir);
const DOWNLOAD_SCRIPT = path.join(sys.baseDir(), "lib/toolkit/youtube/download.js");

main();

async function main() {
  sys.assert(argv.idOrUrl, "Invalid id or url, may be special symbols in the argument.");

  await sys.mkdir(OUTPUT_DIR);

  const playlistId = youtube.parsePlaylistByUrl(argv.idOrUrl) || argv.idOrUrl;
  const playlistUrl = youtube.makePlaylistUrl(playlistId);

  verbose(`[${playlistId}]`, "Load playlist info...");
  const rawData = await network.loadData(playlistUrl, { proxy: true });
  const playlistData = youtube.parsePersonalChannel(rawData);
  const playlist = parsePlaylist(playlistData);

  sys.assert(playlist.length > 0, "Oops, empty playlist");

  verbose("Start to download playlist that has", playlist.length, "videos");

  let timers = [];

  for (let i = 0, n = playlist.length; i < n; ++i) {
    let timer = process.hrtime();

    const videoId = _get(playlist[i], "videoId");
    const outDir = OUTPUT_DIR;
    const quality = argv.quality;
    const sampleRate = argv.sampleRate;

    let filename = _get(playlist[i], "title.simpleText");
    sys.assert(filename, `No name: ${videoId}`);
    filename = filename.replace(/\//g, "_");
    filename = ds.leadZero(` ${filename}.mp4`, i, n);

    await download({ videoId, outDir, filename, quality, sampleRate, });

    timer = process.hrtime(timer);
    timers.push(timer[0]);

    verbose(
      "Downloaded", filename,
      "Used", timer[0], "seconds.",
      "Remain", (n - i - 1), "video(s),",
      "estimate", (ds.average(timers) * (n - i - 1) / 60).toFixed(2), "minutes"
    );
  }

  verbose("Playlist downloaded at", OUTPUT_DIR);
}

/**
 * parse playlist
 * @private
 * @param {Object} data playlist json data
 * @returns {Object[]} playlist
 */
function parsePlaylist(data) {
  const tabs = _get(data, "contents.twoColumnBrowseResultsRenderer.tabs", []);
  const channelTab = tabs.find(it => _get(it, "tabRenderer.content")) || {};
  const listContainer = _get(channelTab, "tabRenderer.content.sectionListRenderer.contents", []);
  const gridContainer = _get(listContainer[0], "itemSectionRenderer.contents", []);
  const items = _get(gridContainer[0], "playlistVideoListRenderer.contents", []).map(it => _get(it, "playlistVideoRenderer"));
  return items;
}

function download(options) {
  return new Promise((resolve, reject) => {
    const sub = fork(DOWNLOAD_SCRIPT, [
      `-i="${options.videoId}"`,
      `-d="${options.outDir}"`,
      `--quality=${options.quality}`,
      `--sampleRate=${options.sampleRate}`,
      `--filename=${options.filename}`,
      "--only=video,audio",
    ]);
    let finish = false;
    const onfinish = (code) => {
      if (finish) return;
      finish = true;
      code === 0 ? resolve() : reject(code);
    };
    sub.on("close", onfinish);
    sub.on("exit", onfinish);
    sub.on("error", error => reject(error));
  });
}

function verbose(...messages) {
  if (argv.verbose) {
    Reflect.apply(sys.log, sys, messages);
  }
}