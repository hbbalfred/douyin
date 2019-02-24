const cmd = require("child_process").exec;

const KEY_WORD = "snssdk.com";

module.exports = main;

async function main() {
	console.log("Extract url...");

	const log = await dumpLog();
	await clearLog();

	console.log("Log:", log);
	
	const url = parseUrl(log);
	
	console.log("Video URL:", url);
	return url;
}

function parseUrl(log) {
	let url = log;

	// decode manually avoid the exception "URI malformed"
	// url = decodeURIComponent(url);

	url = url
		.replace(/%26/gi, "&")
		.replace(/%2f/gi, "/")
		.replace(/%3a/gi, ":")
		.replace(/%3d/gi, "=")
		.replace(/%3f/gi, "?")
		;

	url = url.split("&").find(i => i.indexOf(KEY_WORD) !== -1);
	if (!url) {
		throw new Error("Not found the url");
	}

	url = url.substr(url.indexOf("=") + 1);

	return url;
}

function dumpLog() {
	return new Promise((resolve, reject) => {
		cmd(`adb logcat -e ${KEY_WORD} -v raw -d`, (error, stdout, stderr) => {
			if (error) {
				console.error(error);
				reject("Error: Dump adb logcat");
			} else {
				resolve(stdout);
			}
		});
	});
}

function clearLog() {
	new Promise((resolve, reject) => {
		cmd("adb logcat -c -d", (error, stdout, stderr) => {
			if (error) {
				console.error(error);
				reject("Error: Clear adb logcat");
			} else {
				resolve();
			}
		});
	});
}