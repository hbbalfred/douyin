const fs = require("fs");
const _request = require("request");

const exp = module.exports;

/**
 * promislize request
 */
exp.request = function request(options) {
	return new Promise((resolve, reject) => {
		_request(options, (error, res, body) => error ? reject(error) : resolve(body, res));
	});
};

/**
 * safe mkdir likes `mkdir -p`
 */
exp.mkdir = function mkdir(path) {
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

/**
 * promislize `fs.writeFile`
 */
exp.writeFile = function writeFile(path, content) {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, content, { encoding: "utf8" }, (error) => error ? reject(error) : resolve());
	});
};

/**
 * promislize `fs.readFile`
 */
exp.readFile = function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, content, { encoding: "utf8" }, (error, data) => error ? reject(error) : resolve(data));
  });
};

/**
 * wait for seconds
 */
exp.sleep = function sleep(seconds) {
	return new Promise((resolve, reject) => {
		if (typeof seconds !== "number") {
			seconds = 0;
		}
		if (!seconds) {
			return resolve();
		}
		setTimeout(() => resolve(), seconds * 1000);
	});
};