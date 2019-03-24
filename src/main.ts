import { app, BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { PatchModule, RemoveCORS } from "./util";
import { join } from "path";

RemoveCORS()

// Environment variable for development in typescript
const DISCORD_APP_ROOT = process.env.DISCORD_APP_ROOT || __dirname

PatchModule("electron", {
  // Injector for the renderer thread
  // Based on the injector in https://github.com/DiscordInjections/DiscordInjections
  BrowserWindow: Object.assign(function(userOptions: BrowserWindowConstructorOptions) {
    const options = Object.assign({}, userOptions);
    options.webPreferences = Object.assign({}, options.webPreferences)
    options.webPreferences.preload = DISCORD_APP_ROOT;
    options.webPreferences.webSecurity = false;
    const win = new BrowserWindow(options)
    // Allow the renderer process to act on the options
    win.__options = userOptions
    return win;
  }, BrowserWindow)
}, {
  BrowserWindow: "../../browser-window.js"
})

// Starting the application
const Module = require("module");
const AppPath = join(DISCORD_APP_ROOT, "../app.asar");
const AppPackage = require(join(AppPath, "package.json"));

// Adjust electron root
app.getAppPath = () => AppPath;

// Load Discord
Module._load(join(AppPath, AppPackage.main || "index.js"), null, true);