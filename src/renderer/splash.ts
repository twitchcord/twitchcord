import { remote } from "electron";

// Enables a Ctrl+Alt+P accelerator to freeze the splash screen
let prevented = false
window.addEventListener("keydown", event => {
  if (event.key === "p" && event.altKey && event.ctrlKey && !prevented) {
    console.log("Auto-Close prevented")
    prevented = true
    window.addEventListener('beforeunload', event => {
      event.preventDefault()
      event.returnValue = false
    }, { once: true })
    
    const CurrentWindow = remote.getCurrentWindow()
    CurrentWindow.once('hide', () => CurrentWindow.show())

    // Adds a SplashComponent variable to the global scope
    Object.defineProperty(window, "SplashComponent", {
      value: Object.entries(document.querySelector("#splash"))[0][1]
        ._currentElement._owner._instance
    });
  }
})
// When frozen, the Splash cant be updated using
// SplashComponent.setState({ update: { total: 14, current: 3, status: "downloading-updates", progress: 40 } })