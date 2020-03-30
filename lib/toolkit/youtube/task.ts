import fs from "fs";
import { logger } from "./_shared";
import { download } from "./dl";


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

  add(task: ITask) {
    this.children.push(task);
    return this;
  }

  async start() {
    for (const task of this.children) {
      await task.start();
    }
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

    if (this.option.force || !fs.existsSync(path)) {
      await download(this.url, path, this.option.size);
    }
    
    logger.verbose("Save file at %s", path);
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
    await require("../../modules/ffmpeg").merge(this.option.videoPath, this.option.audioPath, this.option.mergePath);
    logger.silly("MergeVideoTask Finish");
  }
}

interface IMergeVideoTaskOpen {
  /** audio path */
  audioPath: string;
  /** video path */
  videoPath: string;
  /** default as same as video path */
  mergePath?: string;
}