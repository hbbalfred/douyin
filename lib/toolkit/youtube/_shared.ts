import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import createLogger from "hbblog/node";

export const logger = createLogger();
logger.colorize(true);


export function assert(condition: any, message: string, ...meta: any[]) {
  if (!condition) {
    logger.error(message, ...meta);
    process.exit(1);
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

  const dir = path.join(process.cwd(), "build/debug");

  mkdirp(dir).then(_ => {
    const file = path.join(dir, time.getTime() + ".dump");
    logger.silly("Dump file: %s", file);
    fs.writeFile(file, data, errorLog);
  }).catch(errorLog);
}
