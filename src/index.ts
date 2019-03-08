import { resolve, join } from "path";
import { readdir } from "fs";
import { promisify } from "util";
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions
} from "electron";

declare module "electron" {
  interface App {
    on(event: 'new-browser-window', listener: (userOptions: BrowserWindowConstructorOptions, options: BrowserWindowConstructorOptions, promise: Promise<BrowserWindow>) => void): void;
  }
}

const PRELOAD = join(__dirname, "preload.js");
const PLUGIN_DIR = join(__dirname, "plugins");

promisify(readdir)(PLUGIN_DIR).then(async files => {
  // Injector for the main thread
  for (const file of files)
    await require(resolve(PLUGIN_DIR, file));
}).then(async () => {
  // Injector for the renderer thread
  // Based on the injector in https://github.com/DiscordInjections/DiscordInjections
  
  app.on('new-browser-window', (userOptions, options, promise) => {
    promise.then((window: any) => window.__options = userOptions)
  
    Object.assign(options, userOptions);
    options.webPreferences = options.webPreferences
      ? Object.assign({}, options.webPreferences)
      : {};
    options.webPreferences.preload = PRELOAD;
  })
  
  const PatchedBrowserWindow = Object.assign(function(userOptions: BrowserWindowConstructorOptions) {
    const options = {}
    let resolve: (value: any) => void
    app.emit('new-browser-window', userOptions, options, new Promise(r => resolve = r))
    const window = new BrowserWindow(options)
    resolve(window)
    return window;
  }, BrowserWindow);

  app.whenReady().then(() => {
    const electronPath = require.resolve("electron")
    const electronCache = require.cache[electronPath]
    const BrowserWindowPath = require.resolve(require.resolve(join(electronPath, '../../browser-window.js')))
    electronCache.exports = Object.assign({}, electronCache.exports);
    electronCache.exports.BrowserWindow = PatchedBrowserWindow;
    require.cache[BrowserWindowPath].exports = PatchedBrowserWindow;
  })
  
  // Starting the application
  const Module = require("module");
  const AppPath = join(__dirname, "../app.asar");
  const AppPackage = require(join(AppPath, "package.json"));
  
  // Adjust electron root
  app.getAppPath = () => AppPath;
  
  // Load Discord
  Module._load(join(AppPath, AppPackage.main || "index.js"), null, true);
})
//*/