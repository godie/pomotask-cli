/**
 * Mock Convex Server for E2E Testing
 * 
 * Implements a minimal Convex HTTP API mock that can intercept
 * queries and mutations for testing the CLI end-to-end.
 * 
 * Usage:
 *   const server = new MockConvexServer(3000);
 *   server.start();
 *   // Run tests
 *   server.stop();
 */

import http from "node:http";

interface ConvexMutation {
  args: Record<string, unknown>;
}

interface ConvexResponse {
  value?: unknown;
  error?: string;
}

type MutationHandler = (args: Record<string, unknown>) => ConvexResponse;
type QueryHandler = (args: Record<string, unknown>) => ConvexResponse;

export class MockConvexServer {
  private server: http.Server | null = null;
  private port: number;
  private mutationHandlers: Map<string, MutationHandler> = new Map();
  private queryHandlers: Map<string, QueryHandler> = new Map();
  private requests: Array<{ method: string; path: string; body?: unknown }> = [];

  constructor(port: number = 3000) {
    this.port = port;
  }

  /**
   * Register a mutation handler
   */
  onMutation(name: string, handler: MutationHandler): void {
    this.mutationHandlers.set(name, handler);
  }

  /**
   * Register a query handler
   */
  onQuery(name: string, handler: QueryHandler): void {
    this.queryHandlers.set(name, handler);
  }

  /**
   * Get recorded requests for assertions
   */
  getRequests() {
    return [...this.requests];
  }

  /**
   * Reset recorded requests
   */
  resetRequests(): void {
    this.requests = [];
  }

  /**
   * Start the mock server
   */
  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          this.requests.push({
            method: req.method || "",
            path: req.url || "",
            body: body ? JSON.parse(body) : undefined,
          });

          const parsedUrl = new URL(req.url || "", `http://localhost:${this.port}`);
          const path = parsedUrl.pathname;

          // Convex HTTP API format: /api/[mutation|query]/name
          const match = path.match(/^\/api\/(mutation|query)\/(.+)$/);

          if (!match) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Not found" }));
            return;
          }

          const [, type, name] = match;
          const fullName = name.replace(/:/g, "."); // Convert : to . for namespacing

          try {
            const requestBody = body ? JSON.parse(body) : {};
            const args = requestBody.args || {};

            if (type === "mutation") {
              const handler = this.mutationHandlers.get(fullName);
              if (handler) {
                const response = handler(args);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ value: response }));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ value: null }));
              }
            } else {
              const handler = this.queryHandlers.get(fullName);
              if (handler) {
                const response = handler(args);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ value: response }));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ value: null }));
              }
            }
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : "Internal error",
              })
            );
          }
        });
      });

      this.server.listen(this.port, () => {
        resolve();
      });
    });
  }

  /**
   * Stop the mock server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
