const fs = require("fs");
const path = require("path");
const ffmpeg = require("./ffmpeg");

const PROJ_DIR = path.resolve(__dirname, "..");
const DEFAULT_VIDEO_DIR = path.join(PROJ_DIR, "video");
const DEFAULT_TMP_DIR = path.join(PROJ_DIR, "tmp");
const DEFAULT_FILELIST = path.join(PROJ_DIR, "foo");
const DEFAULT_OUTFILE = path.join(PROJ_DIR, "output.mp4");

main();

async function main() {
	const videoDir = process.argv[2] || DEFAULT_VIDEO_DIR;
	const videoList = fs.readdirSync(videoDir)
		.filter(file => path.extname(file) === ".mp4")
		.map(file => ({
			src: path.join(videoDir, file),
			tmp: path.join(DEFAULT_TMP_DIR, file),
		}));

	for (const file of videoList) {
		await nor(file);
	}

	const filelist = videoList.map(file => `file '${file.tmp}'`).join("\n");

	fs.writeFileSync(DEFAULT_FILELIST, filelist, { encoding: "utf8" });

	await ffmpeg.concat(DEFAULT_FILELIST, DEFAULT_OUTFILE);
}

async function nor(file) {
	const size = await ffmpeg.getSize(file.src);
	if (size.width !== 720 || size.height !== 1280) {
		await ffmpeg.pad(file.src, 720, 1280, file.tmp);
		fs.copyFileSync(file.tmp, file.src);
	}
	await ffmpeg.convert(file.src, file.tmp);
}