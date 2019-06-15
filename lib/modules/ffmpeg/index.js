const { exec } = require("child_process");

const ffmpeg = module.exports;

const EXTRACT_INFO_FIELDS = {
  "width": { parser: parseInt },
  "height": { parser: parseInt },
  "duration": { parser: parseFloat },
  "bit_rate": { parser: parseFloat },
  "r_frame_rate": { alias: "fps", parser: (value) => {
    const expr = value.split("/");
    if (expr.length === 2) return parseFloat(expr[0]) / parseFloat(expr[1]);
    if (expr.length === 1) return parseFloat(expr[0]);
    return -1;
  } },
};

/**
 * get video info
 * @see https://trac.ffmpeg.org/wiki/FFprobeTips
 */
ffmpeg.getInfo = function getInfo(file) {
  const stream = Object.keys(EXTRACT_INFO_FIELDS).join(",");
  const command = `ffprobe -v error -select_streams v:0 -show_entries stream=${stream} -of default=noprint_wrappers=1 "${file}"`;

  return executeCommand(command, (stdout, stderr) => {
    const fields = stdout.trim().split("\n").map(line => {
      const [name, value] = [...line.split("=")];
      return { name, value };
    });

    const info = fields.reduce((dict, field) => {
      const def = EXTRACT_INFO_FIELDS[field.name];

      const k = def.alias || field.name;
      const v = def.parser(field.value);
      dict[k] = v;

      return dict;
    }, {});

    return info;
  });
};

/**
 * pad video
 * @param options { width, height }
 */
ffmpeg.pad = function pad(sourceFile, destFile, options = {}) {
  const { width, height } = options;
  const command = `ffmpeg -v error -i "${sourceFile}" -y -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2" "${destFile}"`;
  return executeCommand(command);
};

/**
 * convert video
 */
ffmpeg.convert = function convert(sourceFile, destFile, options = {}) {
  const {
    fps = 30,
    bit_rate = "1M",
    video_encode = "h264",
    audio_encode = "aac",
  } = options;

  const command = `ffmpeg -v error -i "${sourceFile}" -y -c:a ${audio_encode} -c:v ${video_encode} -r ${fps} -b:v ${bit_rate} "${destFile}"`;
  return executeCommand(command);
};

/**
 * concat videos by file list
 */
ffmpeg.concat = function concat(listFile, destFile) {
  const command = `ffmpeg -v error -y -f concat -safe 0 -i "${listFile}" -c copy "${destFile}"`;
  return executeCommand(command);
};

/**
 * screenshot video
 */
ffmpeg.screenshot = function screenshot(sourceFile, destFile, options = {}) {
  const { time } = options;
  const command = `ffmpeg -v error -ss ${time} -i "${sourceFile}" -y -f image2 -r 1 -vframes 1 "${destFile}"`;
  return executeCommand(command);
};

/**
 * speed 2x
 */
ffmpeg.speed2x = function speed2x(sourceFile, destFile) {
  const command = `ffmpeg -i "${sourceFile}" -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" "${destFile}"`;
  return executeCommand(command);
};

/**
 * merge video and audio in one file
 */
ffmpeg.merge = function merge(videoFile, audioFile, destFile) {
  const command = `ffmpeg -i "${videoFile}" -i "${audioFile}" -c copy "${destFile}"`;
  return executeCommand(command);
};

function executeCommand(command, handler) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      let returnVal;
      if (typeof handler === "function") {
        returnVal = handler(stdout, stderr);
      }

      resolve(returnVal);
    });
  });
}
