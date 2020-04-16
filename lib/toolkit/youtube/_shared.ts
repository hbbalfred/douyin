import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import createLogger from "hbblog/node";
import { promisify } from "util";

export const logger = createLogger();
logger.colorize(true);

const writeFile = promisify(fs.writeFile);


export function assert(cond: any, message: string, ...meta: any[]): asserts cond {
  if (!cond) {
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
export async function dump(content: string, option: IDumpOption = {}) {
  const time = new Date();

  const data = [
    "Type:" + (option.type || "DUMP"),
    "Time:" + time.toISOString(),
    "Comment:" + (option.annotation || ""),
    "Content:" + "\n" + content,
  ].join("\n");

  const dir = path.join(process.cwd(), "build/debug");

  await mkdirp(dir);

  const file = path.join(dir, time.getTime() + ".dump");
  logger.silly("Dump file: %s", file);

  try {
    await writeFile(file, data);
  } catch (error) {
    logger.error("An error has encountered on dump file. File=%s %s", path, error.message);
  }
}
