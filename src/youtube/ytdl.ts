import fs from "fs";
import nodepath from "path";
import Progress from "progress";
import prompts from "prompts";
import ytdl from "ytdl-core";
import yargs from "yargs";
import { abort, normFileName } from "../utils";

const argv = yargs
  .usage("Usage: $0 {youtube_link} [-o|path] [-q|num] [--force]")
  .option("out", {
    alias: "o",
    type: "string",
    default: ".",
    desc: "The path of output file"
  })
  .option("quality", {
    alias: "q",
    type: "number",
    default: 18,
    desc: "Quality format see: https://github.com/fent/node-ytdl-core#ytdlchooseformatformats-options",
  })
  .option("force", {
    alias: "f",
    type: "boolean",
    default: false,
    desc: "Whether force overwrite if the file existed"
  })
  .help("h")
  .parseSync();

main().catch(abort);

async function main() {
  if (!argv._[0]) {
    throw new Error("Missing link");
  }
  const url = argv._[0].toString();

  let path = nodepath.join(process.cwd(), argv.out);
  let existed = fs.existsSync(path);

  if (existed && fs.statSync(path).isDirectory()) {
    const info = await ytdl.getBasicInfo(url);
    const title = normFileName(info.videoDetails.title);
    path = nodepath.join(path, title + ".mp4");
    existed = fs.existsSync(path);
  }

  if (!argv.force && existed) {
    const resp = await prompts({
      type: "confirm",
      name: "override",
      message: "Do you want to overwrite the file",
    });

    if (!resp.override) {
      process.exit(0);
    }
  }

  console.log("Download", url);

  await download(url, path);
}

async function download(url: string, filePath: string) {
  return new Promise((resolve, reject) => {
    const bar = new Progress("[:bar] :rate/bps :percent :etas", {
      complete: "=",
      incomplete: " ",
      width: 60,
      total: 1024 << 10,
    });

    // about quality format: https://github.com/fent/node-ytdl-core#ytdlchooseformatformats-options
    ytdl(url, { quality: argv.quality })
      .on("error", reject)
      .on("progress", (_, loaded, total) => {
        bar.total = total ?? bar.total;
        bar.update(loaded / total);
      })
      .pipe(fs.createWriteStream(filePath))
      .on("error", reject)
      .on("close", resolve)
      ;
  });
}