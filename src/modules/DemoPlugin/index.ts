import { app, Event } from "electron";
import { join } from "path";

app.on("renderer-preload-paths", (evt: Event) =>
  evt.returnValue.push(join(__dirname, "renderer"))
);
