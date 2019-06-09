const path = require("path");
const CONST = require("./utils/constants");
const network = require("./components/network");
const ffmpeg = require("./components/ffmpeg");
const { mkdirAsync, writeFileAsync } = require("./utils/promislize");

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

class YouTubeDownloader {
	static parseVideoId(pageUrl) {
		if (typeof pageUrl !== "string") return;

		let i = pageUrl.indexOf("v=");
		if (i === -1) return;

		let id = pageUrl.substr(i + 2);
		i = id.indexOf("&");

		if (i === -1) {
			
		}
		const pattern = /v=(\w+)/;
		const results = pattern.exec(pageUrl);

		const data = results && results[1];
		return data;
	}
	static parseVideoTitle(pageSource) {
		const pattern = /"title":"[^"]+"/g;
		const results = pattern.exec(pageSource);

		let data = results && results[0];
		data = data.split(":")[1];

		return data.substr(1, data.length - 2);
	}
	static parseVideoLinks(pageSource) {
		const pattern = /"[^"]*projection_type=1[^"]+"/g;
		const results = pattern.exec(pageSource);

		let data = results && results[0];
		data = data.substr(1, data.length - 2);

		const query = function query(item) {
			const fields = {};
			for (const str of item.split("\\u0026")) {
				const expr = str.split("=");
				fields[expr[0]] = expr[1];
			}
			return fields;
		};

		const links = data.split(",").map(item => query(item));
		return links;
	}
	static extractVideoLink(links, type, quality) {
		if (type.includes("/")) {
			type = encodeURIComponent(type);
		}

		links = links.filter(link => link.type.startsWith(type));

		const link = type.startsWith("video")
			? links.find(link => link.quality_label === quality)
			: links.find(link => !quality || link.audio_sample_rate === quality);

		if (link) {
			const copy = Object.assign({}, link);
			copy.url = decodeURIComponent(copy.url);
			copy.type = decodeURIComponent(copy.type);
			return copy;
		}
	}
	static constructCoverImageUrl(videoId) {
		return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
	}

	constructor(pageUrl, baseDir) {
		this._pageUrl = pageUrl;
		this._baseDir = baseDir || CONST.PWD;
	}

	async load() {
		console.log("Start to load:", this._pageUrl);
		
		const source = await network.loadPageSource(this._pageUrl, { proxy: true });
		console.log("Page source code load complete");
		
		const videoId = YouTubeDownloader.parseVideoId(this._pageUrl);
		const videoTitle = YouTubeDownloader.parseVideoTitle(source);
		const videoImageUrl = YouTubeDownloader.constructCoverImageUrl(videoId);

		const links = YouTubeDownloader.parseVideoLinks(source);
		const audioLink = YouTubeDownloader.extractVideoLink(links, "audio");
		const videoLink = YouTubeDownloader.extractVideoLink(links, "video/mp4", "720p")
			|| YouTubeDownloader.extractVideoLink(links, "video/mp4", "480p")
			|| YouTubeDownloader.extractVideoLink(links, "video/mp4", "360p");

		if (!audioLink) {
			throw new Error("Not found audio link");
		}
		if (!videoLink) {
			throw new Error("Not found video link <720p|480p|360p>");
		}

		const saveDir = path.resolve(this._baseDir, videoId);
		await mkdirAsync(saveDir);

		const infoFilePath = path.join(saveDir, "info.txt");
		const coverFilePath = path.join(saveDir, "cover.jpg");
		const videoFilePath = path.join(saveDir, "video.mp4");
		const audioFilePath = path.join(saveDir, "audio.m4a");
		const finalFilePath = path.join(saveDir, "final.mp4");

		await writeFileAsync(infoFilePath, videoTitle);
		console.log("Save video info");

		await network.loadFileTo(videoImageUrl, coverFilePath, { proxy: true });
		console.log("Load complete cover image");

		await network.loadFileTo(videoLink.url, videoFilePath, {
			proxy: true,
			onProgress: (loaded) => console.log(videoId, "video progress:", (loaded * 100).toFixed(2) + "%")
		});
		console.log("Load complete video file");

		await network.loadFileTo(audioLink.url, audioFilePath, {
			proxy: true,
			onProgress: (loaded) => console.log(videoId, "audio progress:", (loaded * 100).toFixed(2) + "%")
		});
		console.log("Load complete audio file");

		await ffmpeg.mergeVideoAudio(videoFilePath, audioFilePath, finalFilePath);
		console.log("Load complete:", videoTitle);
	}
}

try {
	new YouTubeDownloader(argv.videourl, argv.savedir).load();
} catch (error) {
	console.error(error);
}
