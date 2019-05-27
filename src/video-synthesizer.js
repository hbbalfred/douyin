const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const ffmpeg = require("./components/ffmpeg");
const CONST = require("./utils/constants");

const DEFAULT_VIDEO_WIDTH = 720;
const DEFAULT_VIDEO_HEIGHT = 1280;

const CONFIG = getConfig();

// rimraf.sync(CONFIG.tmpDir);
// fs.mkdirSync(CONFIG.tmpDir);

main();

function getConfig() {
  const videoDir = process.argv[2] ? path.join(CONST.PWD, process.argv[2]) : path.join(CONST.PROJ_DIR, "video");
  const videoWidth = parseInt(process.argv[3]) || DEFAULT_VIDEO_WIDTH;
  const videoHeight = parseInt(process.argv[4]) || DEFAULT_VIDEO_HEIGHT;
  const tmpDir = path.join(videoDir, "tmp");
  const filelist = path.join(videoDir, "filelist");
  const outputFile = path.join(videoDir, "output.mp4");

  return { videoDir, videoWidth, videoHeight, tmpDir, filelist, outputFile, };
}

async function main() {
  const videoList = fs.readdirSync(CONFIG.videoDir)
    .filter(file => path.extname(file) === ".mp4")
    .map(file => ({
      src: path.join(CONFIG.videoDir, file),
      tmp: path.join(CONFIG.tmpDir, file.replace(/'/g, "_")),
      old: path.join(CONFIG.tmpDir, file),
    }));

  for (const file of videoList) {
    await nor(file);
  }

  const filelist = videoList.map(file => `file '${file.tmp}'`).join("\n");

  fs.writeFileSync(CONFIG.filelist, filelist, { encoding: "utf8" });

  await ffmpeg.concat(CONFIG.filelist, CONFIG.outputFile);
}

async function nor(file) {
  // const size = await ffmpeg.getSize(file.src);
  // if (size.width !== CONFIG.videoWidth || size.height !== CONFIG.videoHeight) {
  //   await ffmpeg.pad(file.src, CONFIG.videoWidth, CONFIG.videoHeight, file.tmp);
  //   fs.copyFileSync(file.tmp, file.src);
  // }
  // await ffmpeg.convert(file.src, file.tmp);
  if (file.old !== file.tmp) {
    if (fs.existsSync(file.old)) {
      fs.renameSync(file.old, file.tmp);
    }
  }
}