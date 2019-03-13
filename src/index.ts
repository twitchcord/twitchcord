import { resolve, join } from "path";
import { readdir } from "fs";
import { promisify } from "util";
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  Event
} from "electron";

declare module "electron" {
  interface App {
    on(
      event: "new-browser-window",
      listener: (
        userOptions: BrowserWindowConstructorOptions,
        options: BrowserWindowConstructorOptions,
        promise: Promise<BrowserWindow>
      ) => void
    ): void;
    on(
      event: "renderer-preload-paths",
      listener: (evt: Event, arg: any) => void
    ): void;
  }
}
const DISCORD_APP_ROOT = process.env.DISCORD_APP_ROOT || __dirname
const PRELOAD = join(DISCORD_APP_ROOT, "preload.js");
const MODULE_DIR = join(__dirname, "modules");

// Injector for the renderer thread
// Based on the injector in https://github.com/DiscordInjections/DiscordInjections

app.on("new-browser-window", (userOptions, options, promise) => {
  promise.then((window: any) => (window.__options = userOptions));

  Object.assign(options, userOptions);
  options.webPreferences = options.webPreferences
    ? Object.assign({}, options.webPreferences)
    : {};
  options.webPreferences.preload = PRELOAD;
});

const PatchedBrowserWindow = Object.assign(function(
  userOptions: BrowserWindowConstructorOptions
) {
  const options = {};
  let resolve: (value: BrowserWindow) => void;
  app.emit(
    "new-browser-window",
    userOptions,
    options,
    new Promise(r => (resolve = r))
  );
  const window = new BrowserWindow(options);
  resolve(window);
  return window;
},
BrowserWindow);

app.whenReady().then(() => {
  const electronPath = require.resolve("electron");
  const electronCache = require.cache[electronPath];
  const BrowserWindowPath = require.resolve(
    require.resolve(join(electronPath, "../../browser-window.js"))
  );
  // Replacing the BrowserWindow contstructor
  require.cache[BrowserWindowPath].exports = PatchedBrowserWindow;
  // Replace the exports object to allow assignment
  electronCache.exports = Object.assign({}, electronCache.exports);
  electronCache.exports.BrowserWindow = PatchedBrowserWindow;
});

ipcMain.on("renderer-preload-paths", (evt: Event, arg: any) => {
  const returnValue: string[] = [];
  app.emit("renderer-preload-paths", { sender: evt.sender, returnValue }, arg);
  evt.returnValue = returnValue;
});

promisify(readdir)(MODULE_DIR)
.then(async files => {
  // Injector for the main thread
  for (const file of files) await import(resolve(MODULE_DIR, file));
})
.catch(() => {})
.then(() => {
  app.whenReady().then(() => new BrowserWindow({ title: "OKAY"}))
    // Starting the application
    const Module = require("module");
    const AppPath = join(DISCORD_APP_ROOT, "../app.asar");
    const AppPackage = require(join(AppPath, "package.json"));

    // Adjust electron root
    app.getAppPath = () => AppPath;

    // Load Discord
    Module._load(join(AppPath, AppPackage.main || "index.js"), null, true);
  });
