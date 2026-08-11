/**
 * sse.ts — push channel (P6, D5). One connection while the tab is open;
 * broadcasts on file change (hop 1: the workbench's own write; hop 2: the
 * harness's writes landing in files). No stored state (A6).
 */

import type { ServerResponse } from "node:http";

export class SseHub {
  private clients = new Set<ServerResponse>();

  add(res: ServerResponse): void {
    this.clients.add(res);
    res.on("close", () => this.clients.delete(res));
  }

  broadcast(payload: unknown): void {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(data);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  count(): number {
    return this.clients.size;
  }
}
