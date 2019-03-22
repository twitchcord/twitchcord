import { join } from "path";
import { PathLike, watch, FSWatcher } from "fs";

export class StyleFile {
  private watcher: FSWatcher
  element = document.createElement("link")
  constructor(public file: PathLike) {
    this.element.setAttribute("type", "text/css")
    this.element.setAttribute("rel", "stylesheet")
    this.update()
  }
  inject(element: Element) {
    element.appendChild(this.element)
  }
  update() {
    this.element.setAttribute("href", `file:///${this.file}?nocache=${Date.now()}`)
  }
  watch(active: boolean) {
    if (this.watcher) this.watcher.close()
    if (active) this.watcher = watch(this.file, () => this.update())
  }
}

export function PatchModule(moduleName: string, NewExports: { [key: string]: any }, RelativePaths: { [key: string]: string }) {
  const ModulePath = require.resolve(moduleName);
  const ModuleCache = require.cache[ModulePath];
  
  for (const key in ModuleCache.exports)
    if (typeof NewExports[key] === "undefined")
      Object.defineProperty(NewExports, key, Object.getOwnPropertyDescriptor(ModuleCache.exports, key))
  
  for (const [Export, path] of Object.entries(RelativePaths))
    require.cache[require.resolve(join(ModulePath, path))].exports = NewExports[Export]

  ModuleCache.exports = NewExports
}