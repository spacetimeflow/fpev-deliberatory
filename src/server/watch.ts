/**
 * watch.ts — file-watch (P6). fs.watch on handoffs/ with a debounce; polling
 * fallback with a change signature when fs.watch is unavailable (D5).
 */

import * as fs from "node:fs";
import * as path from "node:path";

export type ChangeListener = () => void;

export interface WatchHandle {
  stop: () => void;
}

function dirSignature(dir: string): string {
  try {
    return fs
      .readdirSync(dir)
      .map((f) => {
        try {
          return `${f}:${fs.statSync(path.join(dir, f)).mtimeMs}`;
        } catch {
          return f;
        }
      })
      .join("|");
  } catch {
    return "";
  }
}

export function watchProject(dir: string, onChanged: ChangeListener): WatchHandle {
  // watch every dir the panels render from: the project's own + the shared parent's
  // (references/explorations/wiki panels, conversations, handoffs). Editing an
  // exploration or reference must auto-reload the cockpit, not just handoffs.
  const parent = path.dirname(dir);
  const candidates = [
    path.join(dir, "handoffs"),
    path.join(dir, "conversations"),
    path.join(dir, "wiki"),
    path.join(dir, "references"),
    path.join(dir, "explorations"),
    path.join(parent, "wiki"),
    path.join(parent, "references"),
    path.join(parent, "explorations"),
  ];
  const watchDirs = candidates.filter((d) => {
    try {
      fs.accessSync(d);
      return true;
    } catch {
      return false;
    }
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const fire = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(onChanged, 150); // debounce bursts
  };

  if (watchDirs.length === 0) {
    // nothing to watch — poll the project dir for the dirs to appear
    const interval = setInterval(() => {
      try {
        fs.accessSync(path.join(dir, "handoffs"));
        fire();
      } catch {
        /* no handoffs yet */
      }
    }, 2000);
    return { stop: () => clearInterval(interval) };
  }

  let watchers: fs.FSWatcher[] = [];
  let lastSigs = new Map<string, string>();
  try {
    watchers = watchDirs.map((d) => fs.watch(d, { persistent: false }, fire));
    for (const d of watchDirs) lastSigs.set(d, dirSignature(d));
  } catch {
    // polling fallback (D5): fire only when a dir signature changes
    const interval = setInterval(() => {
      for (const d of watchDirs) {
        const sig = dirSignature(d);
        if (sig !== lastSigs.get(d)) {
          lastSigs.set(d, sig);
          fire();
        }
      }
    }, 2000);
    return {
      stop: () => {
        watchers.forEach((w) => w.close());
        clearInterval(interval);
      },
    };
  }

  return {
    stop: () => {
      watchers.forEach((w) => w.close());
      if (timer) clearTimeout(timer);
    },
  };
}
