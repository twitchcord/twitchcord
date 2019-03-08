import { remote, ipcRenderer, BrowserWindowConstructorOptions } from "electron";

declare global {
  interface Window {
    onpreloaded?: (this: Window) => void;
  }
}

for (const path of ipcRenderer.sendSync("renderer-preload-paths")) import(path);

const CurrentWindow = remote.getCurrentWindow() as {
  __options?: BrowserWindowConstructorOptions;
};
if (CurrentWindow.__options && CurrentWindow.__options.webPreferences.preload)
  require(CurrentWindow.__options.webPreferences.preload);

if (window.onpreloaded) window.onpreloaded();
