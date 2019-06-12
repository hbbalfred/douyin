const fs = require("fs");
const path = require("path");
const mime = require("mime");
const request = require("request");

const DEFAULT_PROXY = "http://127.0.0.1:1087";
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36";

const network = module.exports;

/**
 * load data
 */
network.loadData = function loadData(url, options = {}) {
  return new Promise((resolve, reject) => {
    const { contentType = "text/plain" } = options;

    const requestOptions = makeLoadOptions(url, contentType, options);

    request(requestOptions, (error, _, body) => error ? reject(error) : resolve(body));
  });
};

/**
 * load data to destination
 */
network.loadDataTo = function loadDataTo(url, destFile, options = {}) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(destFile);
    const mimeType = (ext && mime.getType(ext)) || "application/octet-stream";
    const requestOptions = makeLoadOptions(url, mimeType, options);

    let loadedBytes = 0, totalBytes = 0;

    request(requestOptions)
      .on("error", error => reject(error))
      .on("response", res => totalBytes = res.headers["content-length"])
      .on("data", chunk => {
        loadedBytes += chunk.length;
        if (options.onProgress) {
          options.onProgress(loadedBytes, totalBytes);
        }
      })
      .on("complete", () => resolve())
      .pipe(fs.createWriteStream(destFile))
      .on("error", error => reject(error));
  });
};

function makeLoadOptions(uri, mimeType, options) {
  options = options || {};

  if (typeof options.proxy !== "string" && options.proxy) {
    options.proxy = DEFAULT_PROXY;
  }

  return {
    uri,
    method: "GET",
    proxy: options.proxy,
    headers: {
      "accept": mimeType,
      "user-agent": DEFAULT_USER_AGENT,
    }
  };
}