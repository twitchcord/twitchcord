import { app, Event } from "electron";
import { join } from "path";

app.on("renderer-preload-paths", (evt: Event) =>
  evt.returnValue.push(join(__dirname, "renderer"))
);
app.on("new-browser-window", (userOptions, options, promise) => {
  promise.then((window: any) => (window.__options = userOptions));
  options.webPreferences.webSecurity = false
});