const ds = require("../../modules/ds");

const youtube = module.exports;

/**
 * Make the url of watching video
 * @param {String} videoId
 */
youtube.makeWatchingUrl = function makeVideoUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Make the url of get video info
 * @param {String} videoId
 */
youtube.makeInfoUrl = function makeInfoUrl(videoId) {
  return `https://www.youtube.com/get_video_info?video_id=${videoId}`;
};

/**
 * Make the url of thumbnails
 * @param {String} videoId
 * @param {String} resolution <maxres|hq|mq|sd>
 * @param {String} image <default|1|2|3>
 */
youtube.makeThumbnailUrl = function makeThumbnailUrl(videoId, resolution = "maxres", image = "default") {
  return `https://i.ytimg.com/vi/${videoId}/${resolution}${image}.jpg`;
};

/**
 * Parse video id by url such as https://www.youtube.com/watch?v=SCk2gJUX2hc
 * @param {String} url
 */
youtube.parseVideoIdByUrl = function parseVideoIdByUrl(url) {
  if (typeof url !== "string") return;

  let i = url.indexOf("v=");
  if (i === -1) return;

  let id = url.substr(i + 2);

  i = id.indexOf("&");
  id = i === -1 ? id : id.substr(0, i);
	
  return id;
};

/**
 * Parse video info
 * @param {String} data
 */
youtube.parseVideoInfo = function parseVideoInfo(data) {
  const info = ds.exprToDict(data, "&");

  const interest = ["title", "author", "adaptive_fmts"];
  interest.filter(key => info[key]).forEach(key => info[key] = info[key] && decodeURIComponent(info[key]));
  
  if (info.adaptive_fmts) {
    info.adaptive_fmts = parseAdaptiveFmts(info.adaptive_fmts, [",", "&"]);
  }
  return info;
};

/**
 * Extract `adaptive_fmts` from the page source of watching video
 * @param {String} pageSource
 */
youtube.extractAdaptiveFmts = function extractAdaptiveFmts(pageSource) {
  const key = "\"adaptive_fmts\":\"";

  let a, b;
  a = pageSource.indexOf(key);
  a += key.length;
  b = pageSource.indexOf("\"", a);

  const adaptive_fmts = pageSource.slice(a, b);

  return parseAdaptiveFmts(adaptive_fmts, [",", "\\u0026"]);
};

/**
 * parse string of `adaptive_fmts`
 * @param {String} str
 * @param {Array<String>} separators 
 */
function parseAdaptiveFmts(str, separators) {
  const adaptive = str.split(separators[0]).map(chunk => ds.exprToDict(chunk, separators[1], separators[2]));

  for (const chunk of adaptive) {
    for (const key in chunk) {
      if (chunk.hasOwnProperty(key)) {
        chunk[key] = decodeURIComponent(chunk[key]);
      }
    }
  }

  return adaptive;
}


/**
 * Parse page source code of personal channel
 * @param {String} pageSource
 */
youtube.parsePersonalChannel = function parsePersonChannel(pageSource) {
  if (typeof pageSource === "string") {
    let a, b;
    a = pageSource.indexOf("window[\"ytInitialData\"]");
    a = pageSource.indexOf("{", a);
    b = pageSource.indexOf(";", a);

    const content = pageSource.slice(a, b);
    const data = JSON.parse(content);
    return data;
  }
};
