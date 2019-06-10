const YouTubeDownloader = require("./youtube/downloader");

// Command line arguments
const argv = require("yargs")
	.option("videourl", {
		alias: "v",
		describe: "The url of videos",
		demandOption: true,
	})
	.option("savedir", {
		alias: "d",
		describe: "The directory to save video",
		demandOption: false,
	})
	.help()
	.argv;

try {
	new YouTubeDownloader(argv.videourl, argv.savedir).load();
} catch (error) {
	console.error(error);
}
