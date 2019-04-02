import { promisify } from "util";
import { join } from "path";
import fs from "fs";

const exists = promisify(fs.exists);

export class CSSFile {
  private watcher: fs.FSWatcher;
  exists = false;
  element = document.createElement("link");
  constructor(public file: fs.PathLike) {
    this.element.setAttribute("type", "text/css");
    this.element.setAttribute("rel", "stylesheet");
    this.update();
  }
  inject(element: Element) {
    element.appendChild(this.element);
  }
  update() {
    exists(this.file).then(
      yes =>
        (this.exists = yes) &&
        this.element.setAttribute(
          "href",
          `file:///${this.file}?nocache=${Date.now()}`
        )
    );
  }
  watch(active: boolean) {
    if (this.watcher) this.watcher.close();
    if (active) this.watcher = fs.watch(this.file, () => this.update());
  }
}

export function PatchModule(
  moduleName: string,
  NewExports: { [key: string]: any },
  RelativePaths: { [key: string]: string }
) {
  const ModulePath = require.resolve(moduleName);
  const ModuleCache = require.cache[ModulePath];

  for (const key in ModuleCache.exports)
    if (typeof NewExports[key] === "undefined")
      Object.defineProperty(
        NewExports,
        key,
        Object.getOwnPropertyDescriptor(ModuleCache.exports, key)
      );

  for (const [Export, path] of Object.entries(RelativePaths))
    require.cache[require.resolve(join(ModulePath, path))].exports =
      NewExports[Export];

  ModuleCache.exports = NewExports;
}
