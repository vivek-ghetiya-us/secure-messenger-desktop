import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import AppDatabase from "./db/database";
import { registerAllHandlers } from "./handlers";
import { WebSocketClient } from "./websocket/client";
import { MessageSimulatorServer } from "./websocket/server";

let db: AppDatabase;
let wsServer: MessageSimulatorServer;
let wsClient: WebSocketClient;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open DevTools in development
    win.webContents.openDevTools();
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("before-quit", () => {
  if (wsClient) {
    wsClient.disconnect();
  }
  if (wsServer) {
    wsServer.close();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  db = new AppDatabase();

  // Initialize WebSocket server
  wsServer = new MessageSimulatorServer(db.db, 8080);
  console.log("WebSocket server started on ws://localhost:8080");

  // Initialize WebSocket client
  wsClient = new WebSocketClient("ws://localhost:8080");

  createWindow();

  // Register all handlers (pass WebSocket components and window)
  registerAllHandlers(db.db, wsClient, wsServer, win!);

  // Connect WebSocket client
  wsClient.connect();
});
