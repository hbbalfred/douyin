const cmd = require("child_process").exec;

const WAIT_LOG_TIMEOUT = 2; // seconds

module.exports = main;

async function main() {
	console.log("Extract url...");

	let err, log;

	const timer = Date.now();
	while (!log && (Date.now() - timer) < WAIT_LOG_TIMEOUT * 1000) {
		try { log = await dumpLog(); } catch (error) { err = error; }	
	}

	if (err) {
		throw err;
	}
	if (!log) {
		throw new Error("TIMEOUT: Not found any url");
	}

	await clearLog();

	console.log("Log >>>>>", log);
	
	const urls = parseUrls(log);
	if (!urls) {
		throw new Error("Invalid records");
	}

	return urls;
}

function parseUrls(log) {
	if (!log) {
		return;
	}

	const urls = [];

	for (const row of log.split("\n")) {
		if (!row || !row.trim()) continue;

		const re = /url0=([^&]+)/g;
		const rs = re.exec(row);
		if (!rs) { continue; };

		const link = decode2(rs[1]);

		const mark = link.indexOf("?");
		const query = link.substr(mark + 1);
		const video_id = query.split("&").find(query => query.indexOf("video_id=") === 0);
		
		if (!video_id) {
			console.warn("Not found the video id:", link);
			continue;
		}

		let url = link.substr(0, link.indexOf("?"));
		url = `${url}?${video_id}&ratio=720p`;

		urls.push(url);
	}

	if (urls.length > 0) {
		return urls;
	}
}

/**
 * decode manually avoid the exception "URI malformed"
 */
function decode2(url) {
	return url.replace(/%26/gi, "&")
		.replace(/%2f/gi, "/")
		.replace(/%3a/gi, ":")
		.replace(/%3d/gi, "=")
		.replace(/%3f/gi, "?")
		;
}

function dumpLog() {
	return new Promise((resolve, reject) => {
		cmd(`adb logcat -v raw -d | grep 127.0.0.1`, (error, stdout, stderr) => {
			if (error) {
				reject(error);
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