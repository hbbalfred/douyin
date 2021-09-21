import { spawn } from "child_process";
import ytpl from "ytpl";
import yargs from "yargs";
import colors from "colors";
import { abort, normFileName } from "../utils";

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
    default: true,
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
  .option("retry-failed", {
    type: "number",
    default: 3,
    desc: "Retry to download the failures"
  })
  .help("h")
  .argv;

class Downloader {
  private readonly startIdx: number;
  private readonly endIdx: number;
  private readonly retryMap: Record<string, number> = {};

  constructor(private readonly playlist: ytpl.Result) {
    let startIdx = argv["start-idx"];
    if (startIdx <= 0) {
      startIdx = playlist.items[0].index;
    }
    let endIdx = argv["end-idx"];
    if (endIdx <= 0) {
      endIdx = playlist.items[playlist.items.length - 1].index;
    }
    this.startIdx = startIdx;
    this.endIdx = endIdx;
  }

  async start() {
    const items = this.playlist.items.filter(it => it.index >= this.startIdx && it.index <= this.endIdx);
    console.log("Load %d to %d, Total %d:", this.startIdx, this.endIdx, items.length);

    await this.downloadItems(items);
  }

  private async downloadItems(items: ytpl.Item[]) {
    const failedList: ytpl.Item[] = [];

    for (const item of items) {
      const command = this.makeShellCommand(item);

      console.log(colors.yellow("[%d]"), item.index, colors.bold(item.title));
      console.log("$", colors.grey(command.join(" ")));

      const ok = await execDownload(command);

      if (!ok) {
        failedList.push(item);
      }
    }

    if (failedList.length > 0) {
      await this.retryFailures(failedList);
    }
  }

  private async retryFailures(items: ytpl.Item[]) {
    console.error(colors.red("\nFailed to Download items (%d):"), items.length);

    const code = items.map(it => it.index).join(",");

    if (!this.retryMap[code]) {
      this.retryMap[code] = 0;
    }
    if (++this.retryMap[code] > argv["retry-failed"]) {
      console.error(colors.bold(colors.magenta("Timeout, Max-retry: %d")), argv["retry-failed"]);
      items.forEach(it => {
        const cmd = this.makeShellCommand(it).join(" ");
        console.error(colors.bold(it.title));
        console.error("$", colors.grey(cmd));
      });
      process.exit(1);
    }

    console.error("Retry to download %s time(s), items=%s", this.retryMap[code], code);
    console.error(colors.grey(items.map(it => it.title).join("\n")));
    await this.downloadItems(items);

  }

  private makeShellCommand(item: ytpl.Item) {
    const index = leadzero(item.index, this.playlist.items.length);
    const name = argv["auto-idx"] ? `${index}.${item.title}` : item.title;

    return [
      "./ytdl.sh",
      item.shortUrl,
      "-q", `${argv.quality}`,
      "-o", `"${argv.out}/${normFileName(name)}.mp4"`,
      "--force"
    ];
  }
}

main().catch(abort);

async function main() {
  if (!argv._[0]) {
    throw new Error("Missing link");
  }
  const url = argv._[0].toString();

  const playlist = await ytpl(url, { limit: Infinity });
  console.log("Playlist:", playlist.title);

  const loader = new Downloader(playlist);
  await loader.start();
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