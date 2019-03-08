import { remote, ipcRenderer, BrowserWindowConstructorOptions } from "electron";

declare global {
  interface Window {
    onpreloaded?: (this: Window) => void;
  }
}

const CurrentWindow = remote.getCurrentWindow() as { __options?: BrowserWindowConstructorOptions };
if (CurrentWindow.__options && CurrentWindow.__options.webPreferences.preload)
  require(CurrentWindow.__options.webPreferences.preload);

const CurrentWindow = remote.getCurrentWindow() as any
if (CurrentWindow.__options && CurrentWindow.__options.preload) {
  require(CurrentWindow.__options.preload)
}

if (window.onpreloaded) window.onpreloaded()