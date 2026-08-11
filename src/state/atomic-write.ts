/**
 * atomic-write.ts — atomic file writes with optional backup (absorbed from
 * v0-PiFPEV's state-file-io.ts, generalized to any file — P1/A3: files are the
 * database; the write path must never expose a torn file to readers).
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface WriteResult {
  success: boolean;
  path: string;
  error?: string;
}

/**
 * Atomic write: temp file → fsync → rename. Guarantees readers never see a
 * partially-written file. With `backup: true`, the previous version is copied
 * to `<file>.bak` first (the lineage's .bak precedent).
 */
export function atomicWrite(
  filePath: string,
  content: string | Buffer,
  opts: { backup?: boolean } = {}
): WriteResult {
  const tempPath = filePath + ".tmp";
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (opts.backup && fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, filePath + ".bak");
    }
    fs.writeFileSync(tempPath, content, "utf8");
    const fd = fs.openSync(tempPath, "r");
    try {
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tempPath, filePath);
    return { success: true, path: filePath };
  } catch (err) {
    try {
      fs.unlinkSync(tempPath);
    } catch {
      /* ignore cleanup failure */
    }
    return { success: false, path: filePath, error: String(err) };
  }
}
