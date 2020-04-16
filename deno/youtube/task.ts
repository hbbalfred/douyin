import { existsSync } from "https://deno.land/std/fs/exists.ts";
import { logger } from "./_shared.ts";
import { download } from "./dl.ts";


/**
 * a task essentially is a asynchronous function
 */
export interface ITask {
  start(): Promise<void>;
}

/**
 * execute multi-tasks in queue
 */
export class QueueTask implements ITask {
  private readonly children: ITask[] = [];

  constructor(private readonly name = "queue") {
  }

  add(task: ITask) {
    this.children.push(task);
    return this;
  }

  async start() {
    logger.silly("QueueTask [%s] Start", this.name);
    for (const task of this.children) {
      await task.start();
    }
    logger.silly("QueueTask [%s] Finish", this.name);
  }
}


/**
 * execute a download task
 */
export class DownloadTask implements ITask {
  constructor(private readonly url: string, private readonly option: IDownloadTaskOption) {

  }

  async start() {
    logger.silly("DownloadTask Start");
    const path = this.option.path || "/dev/null";

    if (this.option.force || !existsSync(path)) {
      await download(this.url, path, this.option.size);
    }
    
    logger.verbose("Save file at %s", path);
    logger.silly("DownloadTask Finish");
  }
}

interface IDownloadTaskOption {
  path?: string;
  size?: number;
  force?: boolean;
}


/**
 * execute a task that merge both audio and video into one
 */
export class MergeVideoTask implements ITask {
  constructor(private readonly option: IMergeVideoTaskOpen) {
    
  }

  async start() {
    logger.silly("MergeVideoTask Start");
    logger.error("Buggy compiler: https://deno.land/typedoc/index.html#run");
    // await Deno.run({
    //   cmd: ['ffmpeg', '-y', '-i', this.option.audioPath, '-i', this.option.videoPath, '-c', 'copy', this.option.mergePath]
    // }).status();
    logger.silly("MergeVideoTask Finish");
  }
}

interface IMergeVideoTaskOpen {
  /** audio path */
  audioPath: string;
  /** video path */
  videoPath: string;
  /** final video path */
  mergePath: string;
}