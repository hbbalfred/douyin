const fs = require("fs");
const path = require("path");
const request = require("request");

// const testUrl = "https://aweme.snssdk.com/aweme/v1/play/?video_id=v0200f850000bhnm017k43anidingn00";
const headers = {
	"ACCEPT": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
	"USER-AGENT": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
	"X-FORWARDED-FOR": "58.68.44.61",
};

module.exports = download;

function download(url, dir) {
	return new Promise((resolve, reject) => {
		console.log("Download video...", url);
		
		const now = Date.now().toString();
		const videoPath = path.join(dir, now + ".mp4");

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		request.get(url, { headers }, (error, res, body) => {
			if (error) {
				reject();
				throw new Error("Fail to download the video: " + url);
			}
		})
			.pipe(fs.createWriteStream(videoPath))
			.on("finish", () => {
				console.log("Finish downloading");
				resolve();
			});
	});
}
