const cmd = require("child_process").exec;

const WAIT_LOG_TIMEOUT = 2; // seconds

module.exports = main;

async function main() {
	console.log("Extract url...");

	const log = await dumpLog();
	await clearLog();

	console.log("Log:", log);
	
	let url = parseUrl(log);

	const timer = Date.now();

	while (!url && (Date.now() - timer) < WAIT_LOG_TIMEOUT * 1000) {
		url = parseUrl(log);
	}

	if (!url) {
		throw new Error("TIMEOUT: Not found the url");
	}
	
	console.log("Video URL:", url);
	return url;
}

function parseUrl(log) {
	// decode manually avoid the exception "URI malformed"
	// log = decodeURIComponent(log);

	log = log
		.replace(/%26/gi, "&")
		.replace(/%2f/gi, "/")
		.replace(/%3a/gi, ":")
		.replace(/%3d/gi, "=")
		.replace(/%3f/gi, "?")
		;
	const urls = log.split("&");

	let url = urls.find(u => u.indexOf("ixigua.com") !== -1);
	if (!url) {
		url = urls.find(u => u.indexOf("snssdk.com") !== -1);
	}

	if (url) {
		url = url.substr(url.indexOf("=") + 1);
	}
	return url;
}

function dumpLog() {
	return new Promise((resolve, reject) => {
		cmd(`adb logcat -e snssdk.com -v raw -d`, (error, stdout, stderr) => {
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