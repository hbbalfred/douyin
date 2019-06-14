const path = require("path");
const sys = require("../../modules/sys");
const network = require("../../modules/network");
const youtube = require("../../webapp/youtube");

// Command line arguments
const argv = require("yargs")
  .option("idOrUrl", {
    alias: "i",
    description: "The id or url of the video",
    demandOption: true,
  })
  .option("resolution", {
    alias: "r",
    description: "The resolution of thumbnails",
    default: "maxres",
  })
  .option("image", {
    alias: "m",
    description: "The image of thumbnails",
    default: "default",
  })
  .help()
  .argv;

main();

async function main() {
  const videoId = youtube.parseVideoIdByUrl(argv.idOrUrl) || argv.idOrUrl;
  const thumbnailUrl = youtube.makeThumbnailUrl(videoId, argv.resolution, argv.image);
  const destination = path.join(sys.baseDir(), path.basename(thumbnailUrl));

  console.log("Start to download thumbnail", thumbnailUrl);
  await network.loadDataTo(thumbnailUrl, destination, { proxy: true });
}
