import { StyleFile } from './util';
import { remote } from "electron";
import { join } from "path";

const WINDOW_TYPE = location.href.startsWith("https://discordapp.com/") ? "main" : "splash"

const CSSFile = new StyleFile(join(__dirname, "../assets/styles", `${WINDOW_TYPE}.css`))
CSSFile.watch(true)
document.addEventListener("DOMContentLoaded", () => CSSFile.inject(document.querySelector("head")));

require("./renderer/"+ WINDOW_TYPE);



const CurrentWindow = remote.getCurrentWindow()
if (CurrentWindow.__options && CurrentWindow.__options.webPreferences.preload)
  require(CurrentWindow.__options.webPreferences.preload);

if (window.onpreloaded) window.onpreloaded();
