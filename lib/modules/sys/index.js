const fs = require("fs");
const rimraf = require("rimraf");
const _request = require("request");
const SingleLineLogger = require("./single-line-logger");

const sys = module.exports;

/**
 * base directory
 */
sys.baseDir = function baseDir() {
  return process.cwd();
};

/**
 * promislize request
 */
sys.request = function request(options) {
  return new Promise((resolve, reject) => {
    _request(options, (error, res, body) => error ? reject(error) : resolve(body, res));
  });
};

/**
 * safe mkdir likes `mkdir -p`
 */
sys.mkdir = function mkdir(path) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      resolve();
    } else {
      fs.mkdir(path, (error) => error ? reject(error) : resolve());
    }
  });
};

/**
 * rmdir recursivly
 */
sys.rmdir = function rmdir(path, forced = true) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path)) {
      return resolve();
    }

    if (!forced) {
      return reject(new Error("The target already exists: " + path));
    }

    rimraf(path, (error) => error ? reject(error) : resolve());
  });
};

/**
 * promislize `fs.writeFile`
 */
sys.writeFile = function writeFile(path, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, { encoding: "utf8" }, (error) => error ? reject(error) : resolve());
  });
};

/**
 * promislize `fs.readFile`
 */
sys.readFile = function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: "utf8" }, (error, data) => error ? reject(error) : resolve(data));
  });
};

/**
 * wait for seconds
 */
sys.wait = function wait(seconds) {
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

/**
 * create a signle line logger
 */
sys.singleLineLog = function singleLineLog() {
  return new SingleLineLogger();
};

/**
 * assert condition
 */
sys.assert = function assert(condition, ...message) {
  if (!condition) {
    console.error.apply(null, message);
    process.exit(1);
  }
};