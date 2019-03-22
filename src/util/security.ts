import { app, session } from "electron";

export function RemoveCORS() {
  app.whenReady().then(() => {
    session.defaultSession.webRequest.onHeadersReceived((details, done) => {
      const responseHeaders = details.responseHeaders as {
        [key: string]: string;
      };

      for (const header in responseHeaders)
        if (header.toLowerCase().startsWith("content-security-policy"))
          delete responseHeaders[header];

      done({ cancel: false, responseHeaders });
    });
  });
}
