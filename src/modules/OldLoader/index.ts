import { session, app, Event } from "electron";
import { join } from "path";

app.on("renderer-preload-paths", (evt: Event) => {
  if (evt.sender.getURL().startsWith("https://discordapp.com/app"))
    evt.returnValue.push(join(__dirname, "mainWindow"));
    else evt.returnValue.push(join(__dirname, "splash"))
});
app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, done) => {
    const responseHeaders = details.responseHeaders as {
      [key: string]: string;
    };
  
    for (const header in responseHeaders)
      if (header.toLowerCase().startsWith("content-security-policy"))
        delete responseHeaders[header];
  
    done({ cancel: false, responseHeaders})
  })
})