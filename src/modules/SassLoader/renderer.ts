import { render } from "../OldLoader/old-core/node_modules/node-sass";
import { join, dirname, basename } from "path";
import { watch, writeFile } from "fs";

const folder = join(__dirname, "sass");
const infile = join(folder, "twitchcord.scss");
const timeout = 1000;

const el = document.createElement("link");
document.addEventListener("DOMContentLoaded", () =>
  document.querySelector("head").appendChild(el)
);
el.setAttribute("type", "text/css");
el.setAttribute("rel", "stylesheet");
el.setAttribute("id", "InjectedSASS");

const doInject = (file: string) =>
  render(
    {
      file,
      outputStyle: "compressed",
      sourceMap: true,
      outFile: basename(file, "scss") + "out.css"
    },
    (err, res) => {
      if (err) return console.error(err);
      const SourceMap = JSON.parse(res.map.toString());
      SourceMap.sources = SourceMap.sources.map(source => "file:///" + source);
      const outfile = join(dirname(file), basename(file, "scss") + "out.css");
      writeFile(
        outfile,
        Buffer.concat([res.css, Buffer.from("\n/*# sourceMappingURL=data:application/json;base64," + btoa(JSON.stringify(SourceMap)) +" */`")]),
        err => {
          if (err) console.error(err);
          el.setAttribute("href", `file:///${outfile}?nocache=${Date.now()}`);
        }
      );
    }
  );
let latest = 0;
watch(folder, { recursive: true }, (_, filename) => {
  const now = Date.now();
  if (latest + timeout > now) return;
  latest = now;

  if (filename.endsWith(".scss")) {
    console.log("Loading Sass...");
    setTimeout(() => doInject(infile), 200);
  }
});

// Comment this out to prevent the css from being automatically loaded
doInject(infile);
