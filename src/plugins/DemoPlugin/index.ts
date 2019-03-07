import { ipcMain, Event } from "electron";
import { join } from "path";

ipcMain.on('renderer-preload-paths', (evt: Event) => evt.returnValue = (evt.returnValue || []).concat(join(__dirname, "renderer")))