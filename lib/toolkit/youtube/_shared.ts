import createLogger from "hbblog/node";

export const logger = createLogger();
logger.colorize(true);


export function assert(condition: any, message: string, ...meta: any[]) {
  if (!condition) {
    logger.error(message, ...meta);
    process.exit(1);
  }
}