const fs = require("fs");

module.exports = parsePlayList;

function parsePlayList(path) {
	const list = fs.readFileSync(path, { encoding: "utf8" }).trim().split("\n");

	const playList = [];

	for (let i = 0; i < list.length; i += 2) {
		playList.push({ duration: list[i].trim(), name: list[i + 1].trim() });
	}

	return playList;
}
