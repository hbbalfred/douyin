const ds = require("../../modules/ds");

function obsolete(message) {
  return function () {
    console.error("obsolete:", message);
    process.exit(1);
  };
}

const youtube = module.exports;

/**
 * Make the url of watching video
 * @param {String} videoId
 */
youtube.makeWatchingUrl = function makeVideoUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Make the url of playlist
 * @param {String} playlist
 */
youtube.makePlaylistUrl = function makePlaylistUrl(playlist) {
  return `https://www.youtube.com/playlist?list=${playlist}`;
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
 * Parse the playlist by url such as https://www.youtube.com/playlist?list=PLrs8s8zA63gWj8oZT7zUbjQWK7blvB2Yj
 * @param {String} url
 */
youtube.parsePlaylistByUrl = function parsePlaylistByUrl(url) {
  if (typeof url !== "string") return;

  let i = url.indexOf("list=");
  if (i === -1) return;

  let id = url.substr(i + 5);

  i = id.indexOf("&");
  id = i === -1 ? id : id.substr(0, i);

  return id;
};

/**
 * Parse video info
 * @param {String} data
 */
youtube.parseVideoInfo = obsolete("youtube.parseVideoInfo");

/**
 * Extract `adaptive_fmts` from the page source of watching video
 * @param {String} pageSource
 */
youtube.extractAdaptiveFmts = obsolete("youtube.extractAdaptiveFmts");


/**
 * Parse page source code of personal channel
 * @param {String} pageSource
 */
youtube.parsePersonalChannel = function parsePersonChannel(pageSource) {
  if (typeof pageSource === "string") {
    let a, b, content;

    a = pageSource.indexOf("window[\"ytInitialData\"]");

    if (pageSource.indexOf("JSON.parse", a) !== -1) {
      a = pageSource.indexOf("{", a);
      b = pageSource.indexOf(";", a);
      b = pageSource.lastIndexOf("}", b);
      content = pageSource.slice(a, b + 1).replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
    } else {
      a = pageSource.indexOf("{", a);
      b = pageSource.indexOf(";", a);
      while (pageSource[b-1] !== "}" && b !== -1) {
        b = pageSource.indexOf(";", b + 1);
      }
      content = pageSource.slice(a, b);
    }
    
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error(error);
      
      console.log(content);
      process.exit(1);
    }
  }
};

