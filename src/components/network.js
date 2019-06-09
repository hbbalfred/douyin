const fs = require("fs");
const mime = require("mime");
const path = require("path");
const request = require("request");

const DEFAULT_PROXY = "http://127.0.0.1:1087";
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36";

const exp = module.exports;

exp.loadPageSource = async function loadPageSource(uri, options) {
	return new Promise((resolve, reject) => {
		// fs.readFile("/Users/hbb/Documents/workspace/douyin/bar", {encoding:"utf-8"}, (error, data) => error ? reject(error) : resolve(data));
		const requestOptions = makeLoadOptions(uri, "text/html", options);

		request(requestOptions, (error, _, body) => error ? reject(error) : resolve(body));
	});
};

exp.loadFileTo = async function loadFileTo(uri, savedFile, options) {
	return new Promise((resolve, reject) => {
		const ext = path.extname(savedFile);
		const mimeType = (ext && mime.getType(ext)) || "application/octet-stream";
		const requestOptions = makeLoadOptions(uri, mimeType, options);

		let loadedBytes = 0, totalBytes = 0;

		request(requestOptions)
			.on("error", error => reject(error))
			.on("response", res => totalBytes = res.headers['content-length'])
			.on("data", chunk => {
				loadedBytes += chunk.length;
				if (options.onProgress) {
					options.onProgress(loadedBytes / totalBytes);
				}
			})
			.on("complete", () => resolve())
			.pipe(fs.createWriteStream(savedFile))
			.on("error", error => reject(error));
	});
}

function makeLoadOptions(uri, mimeType, params) {
	params = params || {};

	if (typeof params.proxy !== "string" && params.proxy) {
		params.proxy = DEFAULT_PROXY;
	}

	return {
		uri,
		method: "GET",
		proxy: params.proxy,
		headers: {
			"accept": mimeType,
			"user-agent": DEFAULT_USER_AGENT,
		}
	};
}