const fs = require("fs");
const path = require("path");
const request = require("request");

// const testUrl = "https://aweme.snssdk.com/aweme/v1/play/?video_id=v0200f850000bhnm017k43anidingn00";
const headers = {
	"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
	"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36"
};

module.exports = download;

function download(url, dir) {
	return new Promise((resolve, reject) => {
		console.log("Start to download:", url);
		
		const now = Date.now().toString();
		const videoPath = path.join(dir, now + ".mp4");

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		request.get(url, { headers })
			.on("error", error => console.error(error))
			.pipe(fs.createWriteStream(videoPath))
			.on("error", error => console.error(error))
			.on("finish", () => {
				console.log("Download complete:", videoPath);
				resolve(videoPath);
			});
	});
}
