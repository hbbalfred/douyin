const cmd = require("child_process").exec;

module.exports = {
  getSize,
  getDuration,
  pad,
  convert,
  concat,
  screenshot,
  speed2x
};

function getSize(file) {
	return new Promise((resolve, reject) => {
		cmd(`ffprobe -v error -select_streams v:0 -show_entries stream=height,width -of csv=s=x:p=0 "${file}"`, (error, stdout, stderr) => {
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

function getDuration(file) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -i "${file}" 2>&1 | grep Duration`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      const duration = stdout.split(',')[0].trim().split(' ')[1];
      resolve(duration);
    });
  });
}


function pad(file, tw, th, out) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -v error -i "${file}" -y -vf "scale=${tw}:${th}:force_original_aspect_ratio=decrease,pad=${tw}:${th}:(ow-iw)/2:(oh-ih)/2" "${out}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      console.log("Padded video:", file);
      resolve(out);
    });
  });
}

function convert(file, out) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -v error -i "${file}" -y -c:a aac -c:v h264 -r 60 -b:v 4M "${out}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      console.log("Converted video:", file);
      resolve(out);
    });
  });
}

function concat(filelist, out) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -v error -y -f concat -safe 0 -i "${filelist}" -c copy "${out}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      console.error(stderr);
      console.log("Concated videos:", out);
      resolve(out);
    });
  });
}

function screenshot(file, time, out) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -v error -ss ${time} -i "${file}" -y -f image2 -r 1 -vframes 1 "${out}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      console.log("Captured screenshot:", out);
      resolve(out);
    });
  });
}

function speed2x(file, out) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -i "${file}" -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" "${out}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        return reject(stderr);
      }

      console.log("Speed 2x:", out);
      resolve(out);
    });
  });
  
}