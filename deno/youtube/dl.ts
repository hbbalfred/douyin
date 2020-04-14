//////////////////////////////////////////////////////////////////////
//
// Network Download
//
//////////////////////////////////////////////////////////////////////

import { existsSync } from "https://deno.land/std/fs/exists.ts";
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
export async function psc(url: string, cache?: string) {
  logger.verbose("Load %s", url);

  const headers = { ...COMMON_HTTP_HEADERS };

  let content: string;

  if (cache && existsSync(cache)) {
    logger.silly("Hit cache");
    content = new TextDecoder("utf-8").decode(Deno.readFileSync(cache));
  } else {
    const resp = await fetch(url, { headers });
    content = await resp.text();
  }

  if (cache && !existsSync(cache)) {
    Deno.writeFileSync(cache, new TextEncoder().encode(content));
  }

  if (Deno.env().DEBUG) {
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
