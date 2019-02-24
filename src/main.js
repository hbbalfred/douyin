const extract = require("./extract-url");
const download = require("./loader");
const next = require("./next-video");
const wait = require("./wait");

// extract url
// download video
// wait a moment
// next video

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

		const seconds = 5 + Math.random() * 10;
		await wait(seconds);

		await next();
	} catch (error) {
		if (error.message === "Not found the url") {
			await next();
		} else {
			throw error;
		}
	}
}

process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error);
});