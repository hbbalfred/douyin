import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import got from "got";
import yargs from "yargs";
import get from "lodash/get";
import { assert, logger } from "./_shared";

const argv = yargs
  .option("outDir", {
    alias: "o",
    type: "string",
    description: "The output directory to save assets",
    demandOption: true,
  })
  .option("format", {
    alias: "f",
    type: "string",
    description: "mp3,m4a,360p,480p,720p,1080p,4k,8k",
    default: "360p",
  })
  .option("debug", {
    type: "boolean",
    description: "enable debug mode that will do some extra works such as save page souce code",
    default: true,
  })
  .help()
  .argv;


if (process.env.MOCK) {
  logger.warn("YOU ARE IN MOCK NOW");
  // pack('mock');
} else {
  main();
}


function main() {
  resolve(argv._[0])
    .then(s => s.type === 'playlist' ? extract(s.id) : pack(s.id))
    .then(q => download(q))
    .then(_ => logger.info("Complete"))
    .catch(error => logger.error(error.message))
}


/**
 * parse an url which must be a link of video or playlist
 */
export async function resolve(link: string) {
  logger.verbose("Resolve %s", link);

  if (-1 !== link.indexOf("youtube.com/watch")) {
    const m = link.match(/v=([^&#\s]+)/);
    assert(m, "Invalid video link: %s", link);
    return { type: 'video', id: m![1] };
  }

  if (-1 !== link.indexOf("youtube.com/playlist")) {
    const m = link.match(/list=([^&#\s]+)/);
    assert(m, "Invalid playlist: %s", link);
    return { type: 'playlist', id: m![1] };
  }

  throw new Error("Invalid url:" + link);
}


/**
 * extract playlist to individual videos
 * @param playlist id
 */
async function extract(playlist: string) {
  logger.verbose("Extract playlist: %s", playlist);

  const link = `https://www.youtube.com/playlist?list=${playlist}`;
  const cont = await psc(link);
  const data = parsePageData(cont);
  if (argv.debug) {
    dump(JSON.stringify(data, null, 2), { annotation: `Extract page data from ${link}`, type: 'JSON' });
  }
  const list = getVideoList(data);

  list.forEach(video => logger.verbose(video.title));
  logger.verbose("Total %d videos", list.length);

  const queue = [];
  for (const v of list) {
    queue.push(await pack(v.video));
  }
  return queue;
}

/**
 * pack a video loader
 * @param video id
 */
async function pack(video: string) {
  logger.verbose("Pack a loader of video %s", video);

  const link = `https://www.youtube.com/watch?v=${video}`;
  const cont = await psc(link);
  const data = parseMediaConfig(cont);
  if (argv.debug) {
    dump(JSON.stringify(data, null, 2), { annotation: `Extract media config from ${link}`, type: 'JSON' });
  }
  
  return getMediaDownloadInfo(data);
}

//////////////////////////////////////////////////////////////////////////////////////////
//
// Parse PSC (Page Source Code)
// Notice, these parse functions would need update frequently if youtube change its program.
//
//////////////////////////////////////////////////////////////////////////////////////////

/**
 * Parse media info from the parsed data of video psc
 * @param data parsed json data
 */
function getMediaDownloadInfo(data: object) {
  const resp = get(data, "args.player_response");
  assert(resp, "Failed to parse media info. Not found 'args.player_response'");

  let json: object;

  try {
    json = JSON.parse(resp);
  } catch (error) {
    assert(false, "Failed to parse media info. %s", error.message);
    json = {};
  }

  type AdaptiveFormat = { url: string, mimeType: string, qualityLabel: string, initRange?: object };

  const formats: AdaptiveFormat[] = get(json, "streamingData.adaptiveFormats", []);
  assert(formats.length > 0, "Failed to parse media info, no streaming data");
  
  if (argv.debug) {
    dump(JSON.stringify(json, null, 2), { annotation: "player_response", type: "JSON" });
  }

  // it's a trick to identify the format can downloadable
  const dlcs = formats.filter(info => !!info.initRange);
  // TODO:
  return {};
}

/**
 * Parse video list from the parsed data of playlist psc
 * @param data parsed json data
 */
function getVideoList(data: object) {
  let list: object[] = get(data, "contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents", []);
  list = list.map(it => get(it, "playlistVideoRenderer", {}));

  assert(list.length > 0, "Failed to parse playlist, empty list");

  return list.map(it => {
    const video = get(it, 'videoId') as string;
    assert(video, "Failed to parse playlist, invalid video id: %j", it);
    const title = get(it, 'title.simpleText', '[EMPTY]') as string;
    return { video, title };
  });
}

/**
 * Parse media player data from the page source code.
 * @param psc page source code
 */
function parseMediaConfig(psc: string) {
  const keyword = 'ytplayer.config = ';

  const head = psc.indexOf(keyword);
  assert(head > -1, 'Failed to parse media player data, invalid head');
  const tail = psc.indexOf('};', head);
  assert(tail > -1, 'Failed to parse media player data, invalid tail');

  const code = psc.slice(head + keyword.length, tail + 1);

  try {
    return JSON.parse(code) as object;
  } catch (error) {
    assert(false, "Failed to parse media player data, %s", error.message);
    throw error;
  }
}

/**
 * Parse an initial data object from the page source code.
 * 
 * @param psc page source code
 */
function parsePageData(psc: string) {
  const keyword = 'window["ytInitialData"] = ';

  const head = psc.indexOf(keyword);
  assert(head > -1, "Failed to parse page data, invalid head");
  const tail = psc.indexOf('};', head);
  assert(tail > -1, "Failed to parse page data, invalid tail");

  const code = psc.slice(head + keyword.length, tail + 1);

  try {
    return JSON.parse(code) as object;
  } catch (error) {
    assert(false, "Failed to parse page data, %s", error.message);
    throw error;
  }
}

//////////////////////////////////////////////////////////////////////
//
// Network Download
//
//////////////////////////////////////////////////////////////////////


/**
 * define some common headers, such as 'user-agent'
 */
const COMMON_HTTP_HEADERS = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
};

/**
 * download page source code
 * @param url 
 */
async function psc(url: string) {
  logger.verbose("Load %s", url);

  const headers = { ...COMMON_HTTP_HEADERS };

  let content: string;

  if (process.env.MOCK_FILE) {
    content = fs.readFileSync(process.env.MOCK_FILE, "utf-8");
  } else {
    content = await got.get(url, { headers }).text();
  }

  if (argv.debug) {
    logger.debug("Content length: %d", content.length);
    dump(content, { annotation: `Download page source code from ${url}`, type: "HTML" });
  }

  return content;
}

async function download(...todo: any[]) {
  
}

//////////////////////////////////////////////////////////////////////
//
// Dump File
//
//////////////////////////////////////////////////////////////////////


interface IDumpOption {
  annotation?: string;
  type?: 'JSON'|'HTML';
}

/**
 * dump data to save in local disk
 * @param content dump data
 * @param option dump option
 */
function dump(content: string, option: IDumpOption = {}) {
  const time = new Date();
  
  const data = [
    'Type:' + (option.type || 'DUMP'),
    'Time:' + time.toISOString(),
    'Comment:' + (option.annotation || ''),
    'Content:' + '\n' + content,
  ].join('\n');

  const errorLog = (error?: Error | null) => {
    if (error) {
      logger.error("An error has encountered on dump file. File=%s %s", path, error.message);
    }
  };

  const dir = path.join(process.cwd(), `build/debug`);

  mkdirp(dir).then(_ => {
    const file = path.join(dir, time.getTime() + '.dump');
    logger.silly("Dump file: %s", file);
    fs.writeFile(file, data, errorLog);
  }).catch(errorLog);
}
