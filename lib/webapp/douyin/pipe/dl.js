// const fs = require("fs");
// const path = require("path");
// const download = require("../components/load-video");

// const argv = require("yargs")
// 	.option("outDir", {
// 		alias: "o",
// 		desc: "A directory to store loaded videos",
// 		default: path.resolve(__dirname, "../../build/videos"),
// 	})
// 	.option("minVideoSize", {
// 		alias: "s",
// 		desc: "A threshold of minimum size of video (KB)",
// 		default: 150,
// 	})
// 	.help()
// 	.argv;

// const OUT_STORAGE_DIR = argv.outDir;
// const MIN_VIDEO_SIZE = argv.minVideoSize * 1024;

// if (!fs.existsSync(OUT_STORAGE_DIR)) {
// 	fs.mkdirSync(OUT_STORAGE_DIR);
// }

// const loadedVideoMap = {};

// require("../components/pipe-in").onFinish = input => start(JSON.parse(input));

// async function start(urlMap) {
// 	for (const id in urlMap) {
// 		if (loadedVideoMap[id]) {
// 			continue;
// 		}

// 		const urls = urlMap[id];

// 		let ok = false;
// 		if (typeof urls === "string") {
// 			ok = await loadVideo(urls);
// 		} else if (Array.isArray(urls)) {
// 			ok = await loadVideos(urls);
// 		} else {
// 			console.error("Unknown urls:", id);
// 			continue;
// 		}

// 		loadedVideoMap[id] = ok ? 1 : -1;
// 	}
// }

// async function loadVideo(url) {
// 	const video = await download(url, OUT_STORAGE_DIR);
// 	return fs.statSync(video).size > MIN_VIDEO_SIZE;
// }

// async function loadVideos(urls) {
// 	let ok = false;
// 	const copy = urls.slice(0);
// 	while (!ok && copy.length > 0) {
// 		ok = await loadVideo(copy.pop());
// 	}
// 	return ok;
// }
