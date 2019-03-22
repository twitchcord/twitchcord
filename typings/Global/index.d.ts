import { BrowserWindowConstructorOptions } from "electron";
declare module "electron" {
  interface BrowserWindow {
    __options: BrowserWindowConstructorOptions
  }
}
declare global {
  interface Window {
    onpreloaded?: (this: Window) => void;
  }
}