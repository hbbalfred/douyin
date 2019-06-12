// const fs = require("fs");
// const path = require("path");

// module.exports = main;

// const VALID_HOST_LIST = [
// 	"aweme.snssdk.com",
// 	"api-eagle.amemv.com",
// ];

// const checkedFileMap = {};

// async function main(charlesDir) {
// 	console.log("Extract urls...");

// 	const filelist = fs.readdirSync(charlesDir)
// 		.filter(f => path.extname(f) === ".chlsj")
// 		.filter(f => !checkedFileMap[f]);

// 	let urls = [];

// 	while (filelist.length > 0) {
// 		const charles = path.join(charlesDir, filelist.pop());
// 		const videoList = await parseCharlesFile(charles);

// 		for (const content of videoList) {
// 			const list = parseUrlList(content);
// 			urls = urls.concat(list);
// 		}
// 	}

// 	return urls;
// }

// async function parseCharlesFile(file) {
// 	let data = fs.readFileSync(file, { encoding: "utf8" });
// 	data = JSON.parse(data);

// 	if (!Array.isArray(data)) {
// 		throw new Error("Invalid input file:", file);
// 	}

// 	checkedFileMap[file] = true;

// 	return data
// 		.filter(item => VALID_HOST_LIST.includes(item.host))
// 		.filter(item => item.response && item.response.body && item.response.body.encoding === "base64")
// 		.map(item => item.response.body.encoded);
// }

// function parseUrlList(content) {
// 	const b = Buffer.from(content, "base64");

// 	const json = JSON.parse(b.toString());

// 	return json.aweme_list
// 		.map(item => parsePlayAddr(item.video))
// 		.map(item => ({ id: item.uri, urls: item.url_list }))
// 		;
// }

// function parsePlayAddr(video) {
// 	for (const bit_rate of video.bit_rate) {
// 		switch (bit_rate.gear_name) {
// 			case "normal_1080": return bit_rate.play_addr;
// 			case "normal_720": return bit_rate.play_addr;
// 			case "normal_540": return bit_rate.play_addr;
// 			case "normal_360": return bit_rate.play_addr;
// 			default:
// 		}
// 	}
// 	return video.play_addr;
// }

// /**
//  * decode manually avoid the exception "URI malformed"
//  */
// function decode2(url) {
// 	return url.replace(/%26/gi, "&")
// 		.replace(/%2f/gi, "/")
// 		.replace(/%3a/gi, ":")
// 		.replace(/%3d/gi, "=")
// 		.replace(/%3f/gi, "?")
// 		;
// }

// function dumpLog() {
// 	return new Promise((resolve, reject) => {
// 		cmd(`adb logcat -v raw -d | grep 127.0.0.1`, (error, stdout, stderr) => {
// 			if (error) {
// 				reject(error);
// 			} else {
// 				resolve(stdout);
// 			}
// 		});
// 	});
// }

// function clearLog() {
// 	new Promise((resolve, reject) => {
// 		cmd("adb logcat -c -d", (error, stdout, stderr) => {
// 			if (error) {
// 				console.error(error);
// 				reject("Error: Clear adb logcat");
// 			} else {
// 				resolve();
// 			}
// 		});
// 	});
// }