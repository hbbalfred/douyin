//////////////////////////////////////////////////////////////////////////////////////////
//
// Parse PSC (Page Source Code)
// Notice, these parse functions would need update frequently if youtube change its program.
//
//////////////////////////////////////////////////////////////////////////////////////////

import { assert, dump, logger } from "./_shared";
import get from "lodash/get";
import xmlParser from "fast-xml-parser";
import * as dl from "./dl";

/**
 * partial `player_resonse.videoDetails`
 */
export interface IMediaDetails {
  videoId: string;
  title: string;
  lengthSeconds: number;
  keywords: string[];
  channelId: string;
  shortDescription: string;
  isCrawlable: boolean;
  thumbnail: {
    thumbnails: {
      url: string;
      width: number;
      height: number;
    }
  }[];
  author: string;
}

/**
 * partial `player_resonse.streamingData.adaptiveFormats`
 */
export interface IMediaFormat {
  url: string;
  /** format: "video/mp4; codecs=\"vp9\"" */
  mimeType: string;
  bitrate: number;
  initRange?: object;
  contentLength: string;
  qualityLabel: string;
  cipher?: string;
}

/**
 * Parse media download info from the parsed data of video psc
 * @param data parsed json data
 */
export async function getMediaDownloadInfo(data: object) {
  const resp = get(data, "args.player_response");
  assert(resp, "Failed to parse media info. Not found 'args.player_response'");

  let json: object;

  try {
    json = JSON.parse(resp);
  } catch (error) {
    assert(false, "Failed to parse media info. %s", error.message);
  }

  const details: IMediaDetails = get(json, "videoDetails", {});
  assert(details.videoId && details.title, "Failed to parse media info, invalid video details");

  if (process.env.DEBUG) {
    await dump(JSON.stringify(json, null, 2), { annotation: `video.player_response ${details.videoId}`, type: "JSON" });
  }

  // it's a trick to identify the format can downloadable
  let formats: IMediaFormat[] = get(json, "streamingData.adaptiveFormats", []);
  formats = formats.filter(info => !!info.initRange);

  assert(formats.length > 0, "Failed to parse media info, no streaming data. video=%s", details.videoId);
  
  if (formats[0].cipher) {
    logger.warn("Found cipher, try to load manifest.");
    const manifestUrl: string = get(json, "streamingData.dashManifestUrl");
    assert(manifestUrl, "Not found the manifest url");
    formats = await loadAndParseManifest(manifestUrl);
    assert(formats.length > 0, "Manifest is empty. video=%s", details.videoId);
  }

  assert(formats.every(info => info.url), "Failed to parse media info, no url to download. video=%s", details.videoId);
  
  return { details, formats };
}

async function loadAndParseManifest(url: string) {
  const xml = await dl.psc(url);

  let json: object;
  try {
    json = xmlParser.parse(xml, {
      ignoreAttributes: false,
      attributeNamePrefix: "",
      attrNodeName: "$attrs",
      parseAttributeValue: false,
    }, true);
  } catch (error) {
    assert(false, "Failed to parse manifest: %s", error.message);
  }

  const adaptations: object[] = get(json, "MPD.Period.AdaptationSet", []);
  assert(adaptations.length > 0, "Invalid manifest, not found any adaptation");

  return adaptations.map<IMediaFormat>(it => {
    const mimeType = get(it, "$attrs.mimeType") + "; codecs=\"" + get(it, "Representation.$attrs.codecs") + "\"";
    const url = get(it, "Representation.BaseURL");
    const bitrate = parseFloat(get(it, "Representation.$attrs.bandwidth", 0));
    const initRange = get(it, "Representation.SegmentList.Initialization.$attrs.sourceURL", "sq/0");
    const contentLength = /\/clen\/(\d+)\//.exec(url)?.[1] || "";
    const qualityLabel = get(it, "Representation.$attrs.height") + "p";
    return { mimeType, url, bitrate, contentLength, qualityLabel, initRange: initRange !== "sq/0" ? initRange : undefined };
  });
}

/**
 * Parse video list from the parsed data of playlist psc
 * @param data parsed json data
 */
export function getVideoList(data: object) {
  let list: object[] = get(data, "contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents", []);
  list = list.map(it => get(it, "playlistVideoRenderer", {}));

  assert(list.length > 0, "Failed to parse playlist, empty list");

  return list.map(it => {
    const video = get(it, "videoId") as string;
    assert(video, "Failed to parse playlist, invalid video id: %j", it);
    const title = get(it, "title.simpleText", "[EMPTY]") as string;
    return { video, title };
  });
}

/**
 * Parse media player data from the page source code.
 * @param psc page source code
 */
export function parseMediaConfig(psc: string) {
  const keyword = "ytplayer.config = ";

  const head = psc.indexOf(keyword);
  assert(head > -1, "Failed to parse media player data, invalid head");
  const tail = psc.indexOf("};", head);
  assert(tail > -1, "Failed to parse media player data, invalid tail");

  const code = psc.slice(head + keyword.length, tail + 1);

  try {
    return JSON.parse(code) as object;
  } catch (error) {
    assert(false, "Failed to parse media player data, %s", error.message);
  }
}

/**
 * Parse an initial data object from the page source code.
 * 
 * @param psc page source code
 */
export function parsePageData(psc: string) {
  const keyword = "window[\"ytInitialData\"] = ";

  const head = psc.indexOf(keyword);
  assert(head > -1, "Failed to parse page data, invalid head");
  const tail = psc.indexOf("};", head);
  assert(tail > -1, "Failed to parse page data, invalid tail");

  const code = psc.slice(head + keyword.length, tail + 1);

  try {
    return JSON.parse(code) as object;
  } catch (error) {
    assert(false, "Failed to parse page data, %s", error.message);
  }
}
