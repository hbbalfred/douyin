const extract = require("./extract-url");
const download = require("./loader");
const next = require("./next-video");
const wait = require("./wait");

// extract url
// download video
// wait a moment
// next video

const GLOBAL_MAX_ERROR_TIMES = 5;
let globalErrorTimes = 0;

main();

async function main() {
	while (true) {
		await loop();
	}
}

async function loop() {
	try {
		const url = await extract();

		await download(url);

		const seconds = 2 + Math.random() * 5;
		await wait(seconds);

		await next();
	} catch (error) {
		await next();

		if (++globalErrorTimes > GLOBAL_MAX_ERROR_TIMES) {
			throw error;
		}
	}
}

process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error);
});