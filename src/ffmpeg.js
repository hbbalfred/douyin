const cmd = require("child_process").exec;

module.exports = {
  getSize,
  pad,
  convert,
  concat,
};

function getSize(file) {
	return new Promise((resolve, reject) => {
		cmd(`ffprobe -v error -select_streams v:0 -show_entries stream=height,width -of csv=s=x:p=0 ${file}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      const wh = stdout.split('x');
      const width = parseInt(wh[0]) || 0;
      const height = parseInt(wh[1]) || 0;
      resolve({ width, height });
		});
	});
}

function pad(file, tw, th, out) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -v error -i ${file} -y -vf "scale=${tw}:${th}:force_original_aspect_ratio=decrease,pad=${tw}:${th}:(ow-iw)/2:(oh-ih)/2" ${out}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      console.log("Pad video:", file);
      resolve(out);
    });
  });
}

function convert(file, out) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -v error -i ${file} -y -c:a aac -c:v h264 -r 60 -b:v 4M ${out}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      console.log("Convert video:", file);
      resolve(out);
    });
  });
}

function concat(filelist, out) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -v error -y -f concat -safe 0 -i ${filelist} -c copy ${out}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      console.log("Concat videos");
      resolve(out);
    });
  });
}