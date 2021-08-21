import crypto from "crypto";
import fs from "fs";
import got from "got";
import nodepath from "path";
import { promisify } from "util";

const statFile = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

class FileStore {
  constructor(private readonly rootDir: string) {

  }

  async get(key: string) {
    const name = this.hash(key);
    const path = nodepath.join(this.rootDir, name);
    const st = await statFile(path);
    if (st && st.isFile()) {
      return await readFile(path, { encoding: "utf-8" });
    }
  }

  async set(key: string, val: string) {
    const name = this.hash(key);
    const path = nodepath.join(this.rootDir, name);
    await writeFile(path, val, { encoding: "utf-8" });
  }

  private hash(raw: string) {
    return crypto.createHash("sha256").update(raw).digest("hex");
  }
}

class Cache {
  private readonly memStore: Record<string, string | undefined> = {};
  private readonly fileStore = new FileStore(__dirname);

  async loadCache(url: string) {
    let data = this.memStore[url];
    if (data) {
      return data;
    }

    data = await this.fileStore.get(url);
    if (data) {
      this.memStore[url] = data;
      return data;
    }
  }

  async SaveCache(url: string, data: string) {
    this.memStore[url] = data;
    await this.fileStore.set(url, data);
  }

  async flush() {
    for (const url in this.memStore) {
      const data = this.memStore[url];
      if (data !== undefined) {
        await this.fileStore.set(url, data);
      }
    }
  }

  async loadFromNet(url: string) {
    try {
      return got.get(url).text();
    } catch (error) {
      console.error(url, error);
    }
  }
}
