/*
// child.js
const path = require("path");
const sys = require("./lib/modules/sys");
const ffmpeg = require("./lib/modules/ffmpeg");

// Command line arguments
const argv = require("yargs")
	.option("video", {
		alias: "v",
		describe: "The video file",
		demandOption: true,
	})
	.help()
	.argv;

main();

async function main() {
	console.log("pad...");
	const src = path.resolve(sys.baseDir(), argv.video);
	const dst = path.join(sys.baseDir(), "foo.mp4");
	await ffmpeg.pad(src, dst, { width: 320, height: 240 });

	console.log("wait...");
	await sys.wait(2);

	console.log("completed");
}


// fork.js
const path = require("path");
const { fork } = require("child_process");
const { baseDir } = require("./lib/modules/sys");

const tmp = fork(path.join(baseDir(), "tmp.js"), ["-v", "build/Parasite\ Eve/Parasite Eve I OST (DISC 1) _ 01 - Primal Eyes.mp4"]);

// tmp.stdout.on("data", data => console.log("tmp out:", data.toString()));
// tmp.stderr.on("data", data => console.error("tmp err:", data.toString()));
tmp.on("close", code => console.log("tmp close:", code));

*/
// const fs = require("fs");
// const path = require("path");
// const CONST = require("./utils/constants");
// const network = require("./components/network");
// const YouTubeDownloader = require("./youtube/downloader");
// const YouTubeSniffer = require("./youtube/sniffer");
// const DataStorage = require("./components/data-storage");

// // Command line arguments
// const argv = require("yargs")
//   .option("list", {
//     alias: "l",
//     describe: "The list file of urls to sniffing",
//     demandOption: true,
//   })
//   .option("savedir", {
//     alias: "d",
//     describe: "The directory to save video",
//     demandOption: false,
//   })
//   .help()
//   .argv;

// const YOUTUBE_DATA_FILE = path.join(CONST.PWD, "data/youtube.dat");
// const YOUTUBER_URLS_FILE = path.join(CONST.PWD, "data/youtuber-urls");

// const list = fs.readFileSync(YOUTUBER_LIST_FILE, { encoding: "utf8" }).split("\n");

// class KO {
//   constructor(url) {
//     this._url = url;
//   }

//   start() {

//   }

//   next() {
    
//   }

//   async execute() {
//     const videoData = await youtube.sniff(this._url);
//     const videoId = _get(videoData, "videoId");

//     if (!videoId) {
//       return console.error("Fail to get video id in invalid page url:", this._url);
//     }

//     const exists = await storage.exists(videoId);
//     if (!exists) {
//       await youtube.download(videoId);
//       await storage.save(videoId);
//     }

//     await sys.sleep(this._sleepTime);
//     this.next();
//   }
// }
