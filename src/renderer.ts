import { CSSFile } from "./util";
import { remote } from "electron";
import { join } from "path";

const WINDOW_TYPE = location.href.startsWith("https://discordapp.com/")
  ? "main"
  : location.href.includes("discord_overlay")
  ? "overlay"
  : "splash";

const Styles = new CSSFile(join(__dirname, "../assets/styles", `${WINDOW_TYPE}.css`));
Styles.watch(true);
document.addEventListener("DOMContentLoaded", () => Styles.inject(document.querySelector("head")));

try {
  require("./renderer/" + WINDOW_TYPE);
} catch(e) {
  console.error(e)
}

const CurrentWindow = remote.getCurrentWindow();
if (CurrentWindow.__options && CurrentWindow.__options.webPreferences.preload)
  require(CurrentWindow.__options.webPreferences.preload);

if (window.onpreloaded) window.onpreloaded();
