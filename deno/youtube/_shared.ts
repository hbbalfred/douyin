import * as path from "https://deno.land/std/path/mod.ts";

// FIXME: rewrite in https://deno.land/std/log/
export const logger = {
  error: (message: string, ...meta: unknown[]) => console.error(`[\x1b[31merror\x1b[39m] ${message}`, ...meta),
  warn: (message: string, ...meta: unknown[]) => console.error(`[\x1b[33mwarn\x1b[39m] ${message}`, ...meta),
  info: (message: string, ...meta: unknown[]) => console.info(`[\x1b[32minfo\x1b[39m] ${message}`, ...meta),
  verbose: (message: string, ...meta: unknown[]) => console.log(`[\x1b[36mverbose\x1b[39m] ${message}`, ...meta),
  debug: (message: string, ...meta: unknown[]) => console.log(`[\x1b[34mdebug\x1b[39m] ${message}`, ...meta),
  silly: (message: string, ...meta: unknown[]) => console.log(`[\x1b[35msilly\x1b[39m] ${message}`, ...meta),
};


export function assert(cond: any, message: string, ...meta: any[]): asserts cond {
  if (!cond) {
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
