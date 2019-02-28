const gm = require("gm");
const path = require("path");
const ffmpeg = require("./components/ffmpeg");
const CONST = require("./utils/constants");

const CONFIG = getConfig(process.argv);

main();

function getConfig() {
	if (!process.argv[2]) { throw new Error("Not specified a video file"); }
	if (!process.argv[3]) { throw new Error("Not specified a time to capture"); }

	const videoFile = path.join(CONST.PWD, process.argv[2]);
	const videoDir = path.dirname(videoFile);
	const times = [];
	for (let i = 3; process.argv[i]; ++i) {
		times.push(process.argv[i]);
	}

	return { videoFile, videoDir, times };
}

async function main() {
	const images = [];
	for (let i = 0; i < CONFIG.times.length; ++i) {
		const imageFile = path.join(CONFIG.videoDir, `screenshot${i + 1}.jpg`);
		await ffmpeg.screenshot(CONFIG.videoFile, CONFIG.times[i], imageFile);
		images.push(imageFile);
	}

	let imageMaker = gm(images[0]);
	for (let i = 1; i < images.length; ++i) {
		imageMaker = imageMaker.append(images[i], true);
	}

	const outFile = path.join(CONFIG.videoDir, "cover.jpg");
	imageMaker.write(outFile, error => 
		error ? console.error(error) : console.log("Synthesized image:", outFile)
	);
}

process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error);
});