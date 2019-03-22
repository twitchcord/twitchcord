import { remote } from "electron";

window.addEventListener('beforeunload', event => {
  event.preventDefault()
  event.returnValue = false
})
const CurrentWindow = remote.getCurrentWindow()

CurrentWindow.on('hide', (event: any) => {
  CurrentWindow.show()
})