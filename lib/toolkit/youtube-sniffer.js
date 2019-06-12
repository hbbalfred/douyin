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
