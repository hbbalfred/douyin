const ds = require("../../modules/ds");

const youtube = module.exports;

/**
 * make the url of watching video
 */
youtube.makeWatchingUrl = function makeVideoUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * make the url of get video info
 */
youtube.makeInfoUrl = function makeInfoUrl(videoId) {
  return `https://www.youtube.com/get_video_info?video_id=${videoId}`;
};

/**
 * make the url of video splash
 */
youtube.makeSplashUrl = function makeSplashUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * parse video id by url such as https://www.youtube.com/watch?v=SCk2gJUX2hc
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
 * parse info
 */
youtube.parseInfo = function parseInfo(data) {
  const info = ds.exprToDict(data, "&");

  const interest = ["title", "author", "adaptive_fmts"];
  interest.forEach(key => info[key] = decodeURIComponent(info[key]));

  const adaptive = info.adaptive_fmts.split(",").map(chunk => ds.exprToDict(chunk, "&"));
	
  for (const chunk of adaptive) {
    for (const key in chunk) {
      if (chunk.hasOwnProperty(key)) {
        chunk[key] = decodeURIComponent(chunk[key]);
      }
    }
  }

  info.adaptive_fmts = adaptive;
  return info;
};
