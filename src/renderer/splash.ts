import { remote } from "electron";

function PreventClose() {
  window.addEventListener('beforeunload', event => {
    event.preventDefault()
    event.returnValue = false
  })
  const CurrentWindow = remote.getCurrentWindow()
  
  CurrentWindow.on('hide', (event: any) => {
    CurrentWindow.show()
  })
}

window.addEventListener("DOMContentLoaded", () => {
  Object.defineProperty(window, "SplashComponent", {
    value: Object.entries(document.querySelector("#splash"))[0][1]
      ._currentElement._owner._instance
  });
});
