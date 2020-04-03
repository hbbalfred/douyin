import path from "path";
import yargs from "yargs";
import { assert, dump, logger } from "./_shared";
import * as dl from "./dl";
import * as parser from "./parser";
import { ITask, QueueTask, DownloadTask, MergeVideoTask } from "./task";
import mkdirp from "mkdirp";

const argv = yargs
  .option("outDir", {
    alias: "o",
    type: "string",
    description: "the directory to save videos",
    demandOption: true,
  })
  .option("format", {
    alias: "f",
    type: "string",
    description: "[mp3|m4a|360p|480p|720p|1080p|4k|8k]",
    default: "360p",
  })
  .option("startVideoId", {
    alias: "i",
    type: "string",
    description: "the video id of start downloading in playlist",
  })
  .option("force", {
    type: "boolean",
    description: "override file, even if the file exists already",
    default: false,
  })
  .help()
  .argv;

if (process.env.DEBUG) {
  logger.warn("YOU ARE IN DEBUG MODE");
}

switch (argv.format) {
case "mp3": logger.warn("mp3 not impl, use m4a instead"); argv.format = "m4a"; break;
case "4k": logger.warn("4k not impl, use 1080p instead"); argv.format = "1080p"; break;
case "8k": logger.warn("8k not impl, use 1080p instead"); argv.format = "1080p"; break;
}

// the env 'MOCK_FILE' intended to local testing, but it seems not very easy to use.
start(process.env.MOCK_FILE || argv._[0]);

function start(input: string) {
  resolve(input)
    .then(s => s.type === "playlist" ? extract(s.id) : pack(s.id))
    .then(t => t.start())
    .then(_ => logger.info("Complete"))
    .catch(error => assert(false, error.message));
}

/**
 * parse an url which must be a link of video or playlist
 */
export async function resolve(link: string) {
  logger.verbose("Resolve %s", link);

  if (-1 !== link.indexOf("youtube.com/watch")) {
    const m = link.match(/v=([^&#\s]+)/);
    assert(m, "Invalid video link: %s", link);
    return { type: "video", id: m![1] };
  }

  if (-1 !== link.indexOf("youtube.com/playlist")) {
    const m = link.match(/list=([^&#\s]+)/);
    assert(m, "Invalid playlist: %s", link);
    return { type: "playlist", id: m![1] };
  }

  throw new Error("Invalid url:" + link);
}


/**
 * extract playlist to individual videos
 * @param playlist id
 */
async function extract(playlist: string): Promise<ITask> {
  logger.info("Extract playlist: %s", playlist);

  const link = `https://www.youtube.com/playlist?list=${playlist}`;
  const cont = await dl.psc(link);
  const data = parser.parsePageData(cont);
  if (process.env.DEBUG) {
    dump(JSON.stringify(data, null, 2), { annotation: `Extract page data from ${link}`, type: "JSON" });
  }
  let list = parser.getVideoList(data);

  list.forEach(video => logger.verbose(video.title));
  logger.verbose("Total %d videos", list.length);

  if (argv.startVideoId) {
    const i = list.findIndex(v => v.video === argv.startVideoId);
    assert(i !== -1, "Oops, invalid video id for starting: %s", argv.startVideoId);
    list = list.slice(i);
    logger.info("Start from %s, remain %d videos to download", list[0].title, list.length);
  }

  const queue = new QueueTask(`ExtractPlaylist<${playlist}>`);
  for (const v of list) {
    queue.add(await pack(v.video));
  }
  return queue;
}

/**
 * pack a video loader
 * @param video id
 */
async function pack(video: string): Promise<ITask> {
  logger.info("Pack a loader of video %s", video);

  const link = `https://www.youtube.com/watch?v=${video}`;
  const cont = await dl.psc(link);
  const data = parser.parseMediaConfig(cont);
  if (process.env.DEBUG) {
    dump(JSON.stringify(data, null, 2), { annotation: `Extract media config from ${link}`, type: "JSON" });
  }
  
  const info = parser.getMediaDownloadInfo(data);

  logger.verbose("Pack video info:");
  logger.verbose(" title=%s", info.details.title);

  const dir = path.join(process.cwd(), argv.outDir);
  await mkdirp(dir);

  if (argv.format === "m4a") {
    const audio = pickAudio(info.formats);
    logger.verbose("  audio mime=%s, bitrate=%d", audio.mimeType, audio.bitrate);
    return new DownloadTask(audio.url, {
      path: path.join(dir, safeFilename(info.details.title) + ".m4a"), 
      size: parseInt(audio.contentLength, 10),
      force: argv.force,
    });
  }
  else {
    const audio = pickAudio(info.formats);
    const video = pickVideo(info.formats, argv.format);
    logger.verbose("  audio mime=%s, bitrate=%d", audio.mimeType, audio.bitrate);
    logger.verbose("  video mime=%s, bitrate=%d, quality=%s", video.mimeType, video.bitrate, video.qualityLabel);
    const filename = safeFilename(info.details.title);
    const audioPath = path.join(dir, filename + "_.m4a");
    const videoPath = path.join(dir, filename + "_.mp4");
    const mergePath = path.join(dir, filename + ".mp4");
    return new QueueTask(`PackVideo<${info.details.videoId}>`)
      .add(new DownloadTask(audio.url, { path: audioPath, size: parseInt(audio.contentLength, 10), force: argv.force }))
      .add(new DownloadTask(video.url, { path: videoPath, size: parseInt(video.contentLength, 10), force: argv.force }))
      .add(new MergeVideoTask({ audioPath, videoPath, mergePath }))
    ;
  }
}

function pickAudio(formats: parser.IMediaFormat[], mime = "audio/mp4;") {
  let audios = formats.filter(fmt => fmt.mimeType.startsWith(mime));
  assert(audios.length > 0, "Not found any available audios");
  // pick the best quality one
  audios = audios.sort((a, b) => b.bitrate - a.bitrate);
  return audios[0];
}

function pickVideo(formats: parser.IMediaFormat[], format: string, mime = "video/mp4;") {
  let videos = formats.filter(fmt => fmt.mimeType.startsWith(mime));
  assert(videos.length > 0, "Not found any available videos");
  let video = videos.find(vid => parseInt(vid.qualityLabel) === parseInt(format));

  if (!video) {
    videos = videos.sort((va, vb) => parseInt(va.qualityLabel) - parseInt(vb.qualityLabel));
    // pick the better one at first
    let i = videos.findIndex(vid => parseInt(vid.qualityLabel) > parseInt(format));
    // pick the lower one if no better
    if (i === -1) {
      i = videos.length - 1;
    }
    video = videos[i];
  }

  return video;
}

// more detail https://stackoverflow.com/a/35352640/582989
function safeFilename(path: string) {
  switch (process.platform) {
  case "darwin":
    return path.replace(/[/:]/g, "-");
  case "win32":
    return path.replace(/[\\/:*?"<>|]/g, "-");
  default:
    return path.replace(/[/]/g, "-");
  }
}