//////////////////////////////////////////////////////////////////////
//
// Network Download
//
//////////////////////////////////////////////////////////////////////

import fs from "fs";
import got, { Progress } from "got";
import ProgressBar from "progress";
import stream from "stream";
import { promisify } from "util";
import { dump, logger } from "./_shared";

const pipeline = promisify(stream.pipeline);


/**
 * define some common headers, such as 'user-agent'
 */
const COMMON_HTTP_HEADERS = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
};

/**
 * download page source code
 * @param url 
 */
export async function psc(url: string) {
  logger.verbose("Load %s", url);

  const headers = { ...COMMON_HTTP_HEADERS };

  let content: string;

  if (process.env.MOCK_FILE) {
    content = fs.readFileSync(process.env.MOCK_FILE, "utf-8");
  } else {
    content = await got.get(url, { headers }).text();
  }

  if (process.env.DEBUG) {
    logger.debug("Content length: %d", content.length);
    dump(content, { annotation: `Download page source code from ${url}`, type: "HTML" });
  }

  return content;
}

/**
 * start loader queue to download media
 * @param queue loader queue
 */
export async function download(url: string, to: string, size?: number) {
  logger.verbose("Download %s", url);

  const headers = {
    "connection": "keep-alive",
    ...COMMON_HTTP_HEADERS
  };

  const bar = new ProgressBar("  downloading [:bar] :rate/bps :percent :etas", {
    complete: "=",
    incomplete: " ",
    width: 60,
    total: size || 1024 << 10,
  });

  await pipeline(
    got.stream(url, { headers }).on("downloadProgress", (process: Progress) => {
      bar.total = process.total || bar.total;
      bar.update(process.percent);
    }),
    fs.createWriteStream(to)
  );
}
