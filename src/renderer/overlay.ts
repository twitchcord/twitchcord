import { Cooldown } from '../util'
import { remote } from "electron";

const CurrentWindow = remote.getCurrentWindow();
function toggleDevTools() {
  CurrentWindow.webContents.isDevToolsOpened()
      ? CurrentWindow.webContents.closeDevTools()
    : CurrentWindow.webContents.openDevTools({ mode: "detach" });
}
// Trying to toggle devtools at the speed electron can detect keypresses crashes the renderer
const DevToolsCooldown = new Cooldown(200)
document.addEventListener("keydown", event => {
  if (event.code === "KeyI" && event.ctrlKey && event.shiftKey)
    DevToolsCooldown.fire() && toggleDevTools()
});
