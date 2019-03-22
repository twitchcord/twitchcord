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

// To work on this, uncomment
// PreventClose()
// And update the Splash using
// SplashComponent.setState({ update: { total: 14, current: 3, status: "downloading-updates", progress: 40 } })