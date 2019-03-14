import { render as _render } from "../OldLoader/old-core/node_modules/node-sass";
import { watch, PathLike } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

const folder = join(__dirname, "sass");
const infile = join(folder, "twitchcord.scss");
const timeout = 1000;

type RenderResult = {
  css: Buffer;
  map: Buffer;
  stats: {
    entry: string;
    start: number;
    end: number;
    duration: number;
    includedFiles: string[];
  };
};
type RenderOptions = { file: PathLike; outputStyle?: "compressed", sourceMap?: boolean, sourceMapEmbed?: boolean, outFile?: string };
const render = _render as (
  options: RenderOptions,
  callback: (err: Error, result: RenderResult) => void
) => void;
const compileSassFile = (options: RenderOptions): Promise<RenderResult> => {
  return new Promise((res, rej) => setTimeout(() => render(options, (err, data) => err ? rej(err) : res(data)), 2000))
  // A retry mechanism that could work in theory, but actually ends up crashing discord
  // let retries = 0;
  // return new Promise((res, rej) =>
  //   render(options, (err, data) =>
  //     err.message &&
  //     /^File to (import|read) not found or unreadable/.test(err.message)
  //       ? retries++ < 1000
  //         ? setTimeout(() => res(compileSassFile(options)), 20)
  //         : rej(err)
  //       : res(data)
  //   )
  // );
};

const el = document.createElement("style");
el.setAttribute("id", "InjectedSASS");
document.addEventListener("DOMContentLoaded", () =>
  document.querySelector("head").appendChild(el)
);
function injectCss(css: string) {
  el.innerHTML = css;
}
const doInject = (file: string) =>
  compileSassFile({ file, outputStyle: "compressed", sourceMap: true, outFile: file.replace(/\.scss/, '.css') })
    .then(res => {
      const mapData = JSON.parse(res.map.toString())
      mapData.sources = mapData.sources.map(source => "file:///" + join(folder, source))
      injectCss(`${res.css.toString()}\n/*# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify(mapData))} */`)
    })
    .catch(console.error)
let latest = 0;
watch(folder, { recursive: true }, (_, filename) => {
  const now = Date.now();
  if (latest + timeout > now) return;
  latest = now;

  if (filename.endsWith(".scss")) {
    console.log("Loading Sass...");
    doInject(infile)
  }
});

// Comment this out to prevent the css from being automatically loaded
doInject(infile)