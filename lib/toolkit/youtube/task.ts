import { logger } from "./_shared";


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
    logger.error("TODO:");
  }
}

interface IDownloadTaskOption {
  path?: string;
  size?: number;
}


/**
 * execute a task that merge both audio and video into one
 */
export class MergeVideoTask implements ITask {
  constructor(private readonly option: IMergeVideoTaskOpen) {
    
  }

  async start() {
    logger.error("TODO:");
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