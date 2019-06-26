const fs = require("fs");
const rimraf = require("rimraf");
const mkdirp = require("mkdirp");
const _request = require("request");
const SingleLineLogger = require("./single-line-logger");

const sys = module.exports;

/**
 * base directory
 * @return {String}
 */
sys.baseDir = function baseDir() {
  return process.cwd();
};

/**
 * promislize request
 */
sys.request = function request(options) {
  return new Promise((resolve, reject) => {
    _request(options, (error, _, body) => error ? reject(error) : resolve(body));
  });
};

/**
 * safe mkdir likes `mkdir -p`
 * @param {String} path
 * @returns {Void}
 */
sys.mkdir = function mkdir(path) {
  return new Promise((resolve, reject) => {
    mkdirp(path, (error) => error ? reject(error) : resolve());
  });
};

/**
 * rmdir recursivly
 * @param {String} path
 * @param {Boolean} force default is true
 * @returns {Void}
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
 * @param {String} path
 * @param {String} content
 * @returns {Void}
 */
sys.writeFile = function writeFile(path, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, { encoding: "utf8" }, (error) => error ? reject(error) : resolve());
  });
};

/**
 * promislize `fs.readFile`
 * @param {String} path
 * @return {String}
 */
sys.readFile = function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: "utf8" }, (error, data) => error ? reject(error) : resolve(data));
  });
};

/**
 * wait for seconds
 * @param {Number} seconds
 * @return {Void}
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

/**
 * read directory
 * @param {String} path
 * @param {{caseSensitive: Boolean, fileExtension: String}} options
 * @returns {fs.Dirent[]}
 */
sys.readdir = function readdir(path, options) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, { withFileTypes: true }, (error, files) => {
      if (error) {
        return reject(error);
      }

      options = options || { caseSensitive: false };

      let rval = files;

      if (!options.caseSensitive) {
        const sort = function sort(a, b) {
          if (a < b) return -1;
          if (a > b) return 1;
          return 0;
        };

        rval = rval.sort((fa, fb) => sort(fa.name.toLowerCase(), fb.name.toLowerCase()));  
      }

      if (options.fileExtension) {
        rval = rval.filter(file => file.isFile() && file.name.endsWith(options.fileExtension));
      }

      resolve(rval);
    });
  });
};