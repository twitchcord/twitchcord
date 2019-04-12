import { session, app, BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { PatchModule } from "./util";
import { join, dirname } from "path";

// TODO: Find a way to detect when we are in the overlay process, and execute there

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
  const DISCORD_APP_ROOT = process.env.DISCORD_APP_ROOT || join(__dirname, "../app.asar")
  
  PatchModule("electron", {
    // Injector for the renderer thread
    // Based on the injector in https://github.com/DiscordInjections/DiscordInjections
    BrowserWindow: Object.assign(function(userOptions: BrowserWindowConstructorOptions) {
      const options = Object.assign({}, userOptions);
      options.webPreferences = Object.assign({}, options.webPreferences)
      options.webPreferences.preload = join(dirname(DISCORD_APP_ROOT), "app");
      options.webPreferences.webSecurity = false;
      options.webPreferences.experimentalFeatures = true;
      // Allow the renderer process to act on the options
      win.__options = userOptions
      return win;
    }, BrowserWindow)
  }, {
    BrowserWindow: "../../browser-window.js"
  })
  
  // Starting the application
  const Module = require("module");
  const AppPath = DISCORD_APP_ROOT;
  const AppPackage = require(join(AppPath, "package.json"));
  
  // Adjust electron root
  app.getAppPath = () => AppPath;
  
  // Load Discord
  Module._load(join(AppPath, AppPackage.main || "index.js"), null, true);