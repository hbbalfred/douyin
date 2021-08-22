import { spawn } from "child_process";
import ytpl from "ytpl";
import yargs from "yargs";
import colors from "colors";
import { abort } from "../utils";

const argv = yargs
  .usage("Usage: $0 {playlist_link} -o [dir_path] [...args]")
  .option("out", {
    alias: "o",
    type: "string",
    default: ".",
    desc: "The directory of saving files"
  })
  .option("quality", {
    alias: "q",
    type: "number",
    default: 18,
    desc: "Quality format see: https://github.com/fent/node-ytdl-core#ytdlchooseformatformats-options",
  })
  .option("auto-idx", {
    type: "boolean",
    default: false,
    desc: "Add the index as prefix to file name",
  })
  .option("start-idx", {
    type: "number",
    default: 1,
    desc: "The inclusive index start to load, 1 is the first item"
  })
  .option("end-idx", {
    type: "number",
    default: -1,
    desc: "The inclusive index end to load, -1 is the last item"
  })
  .help("h")
  .argv;


main().catch(abort);

async function main() {
  if (!argv._[0]) {
    throw new Error("Missing link");
  }
  const url = argv._[0].toString();

  const playlist = await ytpl(url, { limit: Infinity });

  // >> Filter playlist

  let startIdx = argv["start-idx"];
  if (startIdx <= 0) {
    startIdx = playlist.items[0].index;
  }
  let endIdx = argv["end-idx"];
  if (endIdx <= 0) {
    endIdx = playlist.items[playlist.items.length - 1].index;
  }

  const items = playlist.items.filter(it => it.index >= startIdx && it.index <= endIdx);

  // >> Download sequentially

  console.log("Playlist:", playlist.title);
  console.log("Load %d to %d, Total %d:", startIdx, endIdx, items.length);

  const failedCommands: string[] = [];

  for (const item of items) {
    const index = leadzero(item.index, items.length);
    const name = argv["auto-idx"] ? `${index}.${item.title}` : item.title;

    const command = [
      "./ytdl.sh",
      item.shortUrl,
      "-q", `${argv.quality}`,
      "-o", `"${argv.out}/${name}.mp4"`,
      "--force"
    ];

    console.log(colors.yellow("[%d]"), item.index, colors.bold(item.title));
    console.log("$", colors.grey(command.join(" ")));

    const ok = await execDownload(command);

    if (!ok) {
      failedCommands.push(command.join(" "));
    }
  }

  // >> Print failed download

  if (failedCommands.length > 0) {
    console.error(colors.red("\nFailed to Download List (%d):"), failedCommands.length);
    console.error(failedCommands.join("\n"));
  }
}

function execDownload(args: string[]) {
  return new Promise<boolean>((resolve, reject) => {
    const subproc = spawn(args[0], args.slice(1), {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });
    subproc.on("error", reject);
    subproc.on("close", code => resolve(code === 0));
  });
}

function leadzero(n: number, count: number) {
  const a = Math.log10(n) >> 0;
  const b = Math.log10(count) >> 0;

  switch (b - a) {
    case 1: return "0" + n;
    case 2: return "00" + n;
    case 3: return "000" + n;
    case 4: return "0000" + n;
    case 5: return "00000" + n;
    default: return n.toString();
  }
}