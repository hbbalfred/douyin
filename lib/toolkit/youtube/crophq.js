const gm = require("gm");
const path = require("path");
const sys = require("../../modules/sys");

const FILE_IMAGE = path.resolve(sys.baseDir(), process.argv[2]);
const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 360;
const BLACK_GAP = 45;
const RESIZE_WIDTH = 1104;
const RESIZE_HEIGHT = 621;

gm(FILE_IMAGE)
  .crop(IMAGE_WIDTH, IMAGE_HEIGHT - BLACK_GAP * 2, 0, BLACK_GAP)
  .resize(RESIZE_WIDTH, RESIZE_HEIGHT)
  .write(FILE_IMAGE, (error, stdout, stderr) => {
    if (error) {
      return console.error(error);
    }
    if (stderr) {
      console.error(stderr);
    }
    if (stdout) {
      console.log(stdout);
    }
  });
