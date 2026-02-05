import WebSocket from "ws";
import { EventEmitter } from "events";
import { SecurityService } from "../services/SecurityService";

export type ConnectionState = "connected" | "reconnecting" | "offline";

export class WebSocketClient extends EventEmitter {
  ws: WebSocket | null = null;
  url: string;
  state: ConnectionState = "offline";
  reconnectAttempts = 0;
  heartbeat?: NodeJS.Timeout;
  reconnectTimer?: NodeJS.Timeout;

  constructor(url: string) {
    super();
    this.url = url;
  }

  connect() {
    this.state = "reconnecting";
    this.emit("stateChange", this.state);

    this.ws = new WebSocket(this.url);

    this.ws.on("open", () => {
      console.log("[WS Client] Connected");
      this.state = "connected";
      this.emit("stateChange", this.state);
      this.reconnectAttempts = 0;

      // Start heartbeat (ping every 10s)
      this.heartbeat = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.ping();
        }
      }, 10000);
    });

    this.ws.on("message", (data) => {
      try {
        this.emit("message", JSON.parse(data.toString()));
      } catch (error) {
        console.error("[WS Client] Parse error:", error);
      }
    });

    this.ws.on("close", () => {
      console.log("[WS Client] Disconnected");
      this.state = "offline";
      this.emit("stateChange", this.state);

      if (this.heartbeat) clearInterval(this.heartbeat);

      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      this.state = "reconnecting";
      this.emit("stateChange", this.state);
      console.log(`[WS Client] Reconnecting in ${delay}ms...`);

      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    });

    this.ws.on("error", (error) => {
      console.error("[WS Client] Error:", SecurityService.sanitizeForLog({
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    });
  }

  getState(): ConnectionState {
    return this.state;
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeat) clearInterval(this.heartbeat);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
