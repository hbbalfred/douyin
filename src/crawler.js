const path = require("path");
const extract = require("./components/extract-url");
const download = require("./components/load-video");
const next = require("./components/next-video");
const wait = require("./components/wait");
const CONST = require("./utils/constants");

// extract url
// download video
// wait a moment
// next video

const GLOBAL_MAX_ERROR_TIMES = 5;
let globalErrorTimes = 0;
let loadedVideos = {};

const CONFIG = getConfig(process.argv);

main();

function getConfig() {
	const storageDir = process.argv[2] ? path.join(CONST.PWD, process.argv[2]) : path.join(CONST.PROJ_DIR, "video");
	return { storageDir };
}

async function main() {
	while (true) {
		await loop();
	}
}

async function loop() {
	try {
		const urls = await extract();

		for (const url of urls) {
			if (!loadedVideos[url]) {
				loadedVideos[url] = 1;
				await download(url, CONFIG.storageDir);
			}
		}

		const seconds = 3 + Math.random() * 10;
		await wait(seconds);

		await next();
		globalErrorTimes = 0;
	} catch (error) {
		await next();

		if (++globalErrorTimes > GLOBAL_MAX_ERROR_TIMES) {
			throw error;
		}
	}
}

process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error);
});