//////////////////////////////////////////////////////////////////////
//
// Network Download
//
//////////////////////////////////////////////////////////////////////

import { existsSync } from "https://deno.land/std/fs/exists.ts";
import { dump, logger, assert } from "./_shared.ts";


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

  const resp = await fetch(url, { headers });
  assert(resp.ok, "Failed to fetch url %s", url);

  const totalBytes = size || Number(resp.headers.get("content-length")) || 0;
  logger.debug("totalBytes:", totalBytes);
  
  const buff = new Uint8Array(1 << 20);

  let loadedBytes = 0;
  let flag = false;
  
  let n = await resp.body.read(buff);
  while (n !== Deno.EOF) {
    loadedBytes += n;

    const data = buff.slice(0, n);
    await Deno.writeFile(to, data, { append: flag, create: !flag });
    
    const percent = (loadedBytes / totalBytes * 100).toFixed(2) + "%";
    
    // FIXME: draw progress bar
    logger.info("  downloading [:bar] :rate/bps %s :etas", percent);
    flag = true;

    n = await resp.body.read(buff);
  }
}
