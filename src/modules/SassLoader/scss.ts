// A replacement `render` method for node-sass which handles all fs operations.
// To avoid issues with node-sass' file detection and hopefully speed up the build

// Turns out it has 0 performance impact (Though incredibly slow if the event loop is clogged)
// Simply waiting for the timeout node-sass needs is generally more efficient
import * as sass from "../OldLoader/old-core/node_modules/node-sass";
import { readFile as CBReadFile, exists as CBExists } from "fs";
import { promisify } from 'util'
import { basename, dirname, resolve } from 'path'

const render = promisify(sass.render)
const readFile = promisify(CBReadFile)
const exists = promisify(CBExists)

export function AttachInlineMap(css: Uint8Array, map: Uint8Array) {
  return `${css}\n/*# sourceMappingURL=data:application/json;base64,${btoa(map.toString())} */`
}
// Get compiled output of file path
// Optionally also generate source map
export async function compile(options: { file?: string } & sass.RenderOptions) {
  let { file, data, sourceMap } = options
  if (!file.endsWith(".scss")) throw new Error("Currently only supports loading .scss files")
  file = resolve(file)
  delete options.file
  options.data = file ? await readFile(file).then(buffer => buffer.toString()) : data
  options.omitSourceMapUrl = options.omitSourceMapUrl === false ? false : true
  if (sourceMap) {
    options.outFile = options.outFile || file.slice(0, -4) + 'css'
  }
  ;(options.importer =  options.importer ? options.importer instanceof Array ? options.importer : [options.importer] : [])
    .push((url, prev, done) => {
      (async () => {
        const Folder = dirname(prev === "stdin" ? file : prev)
        const File = basename(url)
        const Relative = dirname(url)
        const paths = ["", "_"].map(prefix => resolve(Folder, Relative, `${prefix}${File}.scss`))
        let path: string
        for (const test of paths) {
          path = test
          if (await exists(path)) break
        }
        if (!path) done(new Error(path + " does not exist."))
        console.log("FOUND SCSS: ", path)
        readFile(path).then(buffer => done({ file: path, contents: buffer.toString() }))
      })()
    })
  const result = await render(options)
  if (sourceMap) {
    const SourceMap: { sources: string[] } = JSON.parse(result.map.toString())
    const Folder = dirname(file)
    SourceMap.sources = SourceMap.sources.map(sourceFile => sourceFile.endsWith("stdin") ? file : resolve(Folder, sourceFile))
    result.map = Buffer.from(JSON.stringify(SourceMap))
  }
  return result
}