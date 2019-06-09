const fs = require("fs");
const request = require("request");

const exp = module.exports;

exp.requestAsync = function requestAsync(options) {
	return new Promise((resolve, reject) => {
		request(options, (error, res, body) => error ? reject(error) : resolve(body));
	});
};


exp.mkdirAsync = function mkdirAsync(path) {
	return new Promise((resolve, reject) => {
		fs.exists(path, (exists) => {
			if (exists) {
				resolve();
			} else {
				fs.mkdir(path, (error) => error ? reject(error) : resolve());
			}
		});
	});
};


exp.writeFileAsync = function writeFileAsync(path, content) {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, content, { encoding: "utf8" }, (error) => error ? reject(error) : resolve());
	});
};
