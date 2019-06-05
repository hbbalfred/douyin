const path = require("path");
const CONST = require("./utils/constants");
const ffmpeg = require("./components/ffmpeg");

// Command line arguments

main();

async function main() {
	const INPUT_FILE = path.join(CONST.PWD, process.argv[2]);
	const OUTPUT_FILE = path.join(CONST.PWD, process.argv[3]);

	await ffmpeg.speed2x(INPUT_FILE, OUTPUT_FILE);
}