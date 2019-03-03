const next = require("./components/next-video");
const wait = require("./components/wait");

main();

async function main() {
	while (true) {
		const seconds = 3 + Math.random() * 10;

		await wait(seconds);

		await next();
	}
}

process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error);
});