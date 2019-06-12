// // Imports
// const fs = require("fs");
// const path = require("path");
// const extract = require("./components/extract-url");
// const download = require("./components/load-video");
// const wait = require("./components/wait");
// const CONST = require("./utils/constants");

// // Command line arguments
// const argv = require("yargs")
// 	.option("outDir", {
// 		alias: "o",
// 		describe: "The directory to store downloading videos.",
// 		demandOption: true,
// 	})
// 	.option("inputDir", {
// 		alias: "i",
// 		describe: "The directory of Charles logs",
// 		demandOption: true,
// 	})
// 	.option("extractSleep", {
// 		describe: "Sleeping seconds for next extract",
// 		default: 60,
// 	})
// 	.option("downloadSleep", {
// 		describe: "Sleeping seconds for next download",
// 		default: 2,
// 	})
// 	.help()
// 	.argv;

// // Define constants & variables
// const STORAGE_DIR = path.join(CONST.PWD, argv.outDir);
// const CHARLES_DIR = path.join(CONST.PWD, argv.inputDir);
// const MIN_VIDEO_SIZE = 100 * 1024; // bites

// const loadedVideoMap = {};
// const loadVideoQueue = [];

// // Start up
// main();

// // Define functions
// function main() {
// 	startExtract();
// 	startDownload();
// }

// async function startExtract() {
// 	while (true) {
// 		let urlInfo = await extract(CHARLES_DIR);

// 		if (urlInfo && urlInfo.length > 0) {
// 			urlInfo = urlInfo.filter(info => !loadedVideoMap[info.id]);
// 			loadVideoQueue.push(...urlInfo);
// 		}

// 		await wait(argv.extractSleep * 1000);
// 	}
// }

// async function startDownload() {
// 	while (true) {
// 		if (loadVideoQueue.length > 0) {
// 			const info = loadVideoQueue.shift();
// 			const urls = info.urls.slice(0);
// 			let ok = false;
// 			while (!ok && urls.length > 0) {
// 				const videoFile = await download(urls.pop(), STORAGE_DIR);
// 				ok = fs.statSync(videoFile).size > MIN_VIDEO_SIZE;
// 			}
// 			loadedVideoMap[info] = ok ? 1 : -1;
// 		}
// 		await wait(argv.downloadSleep * 1000);
// 	}
// }

// process.on("uncaughtException", (error) => {
// 	console.error("Uncaught exception:", error);
// });