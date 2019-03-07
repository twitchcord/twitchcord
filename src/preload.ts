import { remote, ipcRenderer } from 'electron'

declare global {
  interface Window {
    onpreloaded?: (this: Window) => void;
  }
}

for (const path of ipcRenderer.sendSync('renderer-preload-paths'))
  require(path)

const CurrentWindow = remote.getCurrentWindow() as any
if (CurrentWindow.__options && CurrentWindow.__options.preload) {
  require(CurrentWindow.__options.preload)
}

if (window.onpreloaded) window.onpreloaded()