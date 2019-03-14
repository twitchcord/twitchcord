import { render as _render } from "../OldLoader/old-core/node_modules/node-sass";
import { watch, PathLike } from "fs";
import { join } from "path";

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
type RenderOptions = { file: PathLike; outputStyle?: "compressed" };
const render = _render as (
  options: RenderOptions,
  callback: (err: Error, result: RenderResult) => void
) => void;
const compileSassFile = (options: RenderOptions): Promise<RenderResult> => {
  let retries = 0;
  return new Promise((res, rej) =>
    render(options, (err, data) =>
      err.message &&
      /^File to (import|read) not found or unreadable/.test(err.message)
        ? retries++ < 1000
          ? res(compileSassFile(options))
          : rej(err)
        : res(data)
    )
  );
};

const el = document.createElement("style");
el.setAttribute("id", "InjectedSASS");
document.addEventListener("DOMContentLoaded", () =>
  document.querySelector("head").appendChild(el)
);
function injectCss(css: string) {
  el.innerHTML = css;
}

let latest = 0;
watch(folder, { recursive: true }, (_, filename) => {
  const now = Date.now();
  if (latest + timeout > now) return;
  latest = now;

  if (filename.endsWith(".scss")) {
    console.log("Loading Sass...");
    compileSassFile({ file: infile, outputStyle: "compressed" })
      .then(res => injectCss(res.css.toString()))
      .catch(console.error);
  }
});
