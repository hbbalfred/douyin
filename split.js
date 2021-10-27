var input = "";

process.stdin.on("data", (chunk) => input += chunk.toString());
process.stdin.on("close", () => main());

/*
Usage:
$ cat listfile | TZ=UTC node split.js input.mp4 {out_dir=.} {ext=.mp4}

content format of listfile
name time
name time
...
*/

var path = require("path");
var fs = require("fs");
var format = require("date-fns/format");

var argv = {
    inputFile: process.argv[2],
    outDir: path.resolve(path.join(__dirname, process.argv[3] || "")),
    fileExt: process.argv[4] || ".mp4",
};

if (!argv.inputFile || !fs.statSync(argv.inputFile).isFile()) {
    throw new Error("Invalid input file.");
}
if (!fs.statSync(argv.outDir).isDirectory()) {
    throw new Error("Invalid out directory.");
}

function main() {
    var plist = input.trim().split("\n").map((row, line) => {
        var timeidx = row.lastIndexOf(" ");
        var time = row.substr(timeidx).trim();
        var name = row.substr(0, timeidx).trim();
        if (!name) {
            throw new Error(`Invalid name at ${line+1} line`);
        }
        var timep = time.split(":");
        if (timep.some(t => isNaN(Number(t)))) {
            throw new Error(`Invalid time at ${line + 1} line`);
        }
        if (timep.length < 3) {
            timep.unshift("00");
        }
        time = timep.join(":");

        return {name, time};
    });

    var stime = new Date("2021-10-27T00:00:00Z");

    for (var i = 0, n = plist.length; i < n; ++i) {
        var outFile = path.join(argv.outDir, `${leadzero(i+1, n)} ${plist[i].name}${argv.fileExt}`);

        if (i < plist.length - 1) {
            var a = new Date(`2021-10-27T${plist[i].time}Z`);
            var b = new Date(`2021-10-27T${plist[i + 1].time}Z`);
            var d = new Date(stime.getTime() + (b.getTime() - a.getTime()));
            var t = format(d, "HH:mm:ss");
            console.log(`ffmpeg -y -v error -ss ${plist[i].time} -i "${argv.inputFile}" -c copy -t ${t} "${outFile}"`);
        } else {
            console.log(`ffmpeg -y -v error -ss ${plist[i].time} -i "${argv.inputFile}" -c copy "${outFile}"`);
        }
    }
}

function leadzero(n, total) {
    var a = Math.floor(Math.log10(n));
    var b = Math.floor(Math.log10(total));
    if (a < b) {
        var zero = new Array(b-a).fill("0").join("");
        return zero + n;
    }
    return n;
}
