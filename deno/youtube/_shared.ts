import * as path from "https://deno.land/std/path/mod.ts";

export const logger = {
  error: console.error,
  warn: console.error,
  info: console.info,
  verbose: console.log,
  debug: console.log,
  silly: console.log,
};


export function assert(condition: any, message: string, ...meta: any[]) {
  if (!condition) {
    logger.error(message, ...meta);
    Deno.exit(1);
  }
}

//////////////////////////////////////////////////////////////////////
//
// Dump File
//
//////////////////////////////////////////////////////////////////////


interface IDumpOption {
  annotation?: string;
  type?: "JSON" | "HTML";
}

/**
 * dump data to save in local disk
 * @param content dump data
 * @param option dump option
 */
export function dump(content: string, option: IDumpOption = {}) {
  const time = new Date();

  const data = [
    "Type:" + (option.type || "DUMP"),
    "Time:" + time.toISOString(),
    "Comment:" + (option.annotation || ""),
    "Content:" + "\n" + content,
  ].join("\n");

  const errorLog = (error?: Error | null) => {
    if (error) {
      logger.error("An error has encountered on dump file. File=%s %s", path, error.message);
    }
  };

  const dir = path.join(Deno.cwd(), "/build/debug");

  Deno.mkdir(dir, true).then(_ => {
    const file = path.join(dir, time.getTime() + ".dump");
    logger.silly("Dump file: %s", file);
    Deno.writeFile(file, new TextEncoder().encode(data));
  }).catch(errorLog);
}
