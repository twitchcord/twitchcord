import { session, app, BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { PatchModule } from "./util";
import { join } from "path";

// Remove all csp headers so we can load our own scripts
app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, done) => {
    const responseHeaders = details.responseHeaders as {
      [key: string]: string;
    };

    for (const header in responseHeaders)
      if (header.toLowerCase().startsWith("content-security-policy"))
        delete responseHeaders[header];

    done({ cancel: false, responseHeaders });
  });
});

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