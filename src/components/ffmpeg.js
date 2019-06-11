const exec = require("child_process").exec;

const exp = module.exports;

const EXTRACT_INFO_FIELDS = {
	"width": { type: "int" },
	"height": { type: "int" },
	"duration": { type: "float" },
	"bit_rate": { type: "float" },
	"r_frame_rate": { type: "float", alias: "fps" },
};

/**
 * get video info
 * @see https://trac.ffmpeg.org/wiki/FFprobeTips
 */
exp.getInfo = function getInfo(file) {
	const stream = Object.keys(fields).join(",");
	const command = `ffprobe -v error -select_streams v:0 -show_entries stream=${stream} -of default=noprint_wrappers=1 "${file}"`;

	const convert = (type, value) => {
		switch (type) {
			case "int": return parseInt(value, 10);
			case "float": return parseFloat(value);
			default: return value;
		}
	};

	return executeCommand(command, (stdout, stderr) => {
		const fields = stdout.trim().split("\n").map(line => {
			const [name, value] = [...line.split("=")];
			return { name, value };
		});

		const info = fields.reduce((dict, field) => {
			const def = EXTRACT_INFO_FIELDS[field.name];

			const k = def.alias || field.name;
			const v = convert(def.type, field.value);
			dict[k] = v;

			return dict;
		}, {});

		return info;
	});
}

/**
 * pad video
 * @param options { width, height }
 */
exp.pad = function pad(sourceFile, destFile, options) {
	const { width, height } = options;
	const command = `ffmpeg -v error -i "${sourceFile}" -y -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2" "${destFile}"`;
	return executeCommand(command);
}

/**
 * convert video
 */
exp.convert = function convert(sourceFile, destFile, options) {
	const {
		fps = 30,
		bit_rate = "1M",
		video_encode = "h264",
		audio_encode = "aac",
	} = options;

	const command = `ffmpeg -v error -i "${sourceFile}" -y -c:a ${audio_encode} -c:v ${video_encode} -r ${fps} -b:v ${bit_rate} "${destFile}"`;
	return executeCommand(command);
}

/**
 * concat videos by file list
 */
exp.concat = function concat(listFile, destFile) {
	const command = `ffmpeg -v error -y -f concat -safe 0 -i "${listFile}" -c copy "${destFile}"`;
	return executeCommand(command);
}

/**
 * screenshot video
 */
exp.screenshot = function screenshot(sourceFile, destFile, options) {
	const { time } = options;
	const command = `ffmpeg -v error -ss ${time} -i "${sourceFile}" -y -f image2 -r 1 -vframes 1 "${destFile}"`;
	return executeCommand(command);
}

/**
 * speed 2x
 */
exp.speed2x = function speed2x(sourceFile, destFile) {
	const command = `ffmpeg -i "${sourceFile}" -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" "${destFile}"`;
	return executeCommand(command);
}

/**
 * merge video and audio in one file
 */
exp.merge = function merge(videoFile, audioFile, destFile) {
	const command = `ffmpeg -i "${videoFile}" -i "${audioFile}" -c copy "${destFile}"`;
	return executeCommand(command);
}

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
