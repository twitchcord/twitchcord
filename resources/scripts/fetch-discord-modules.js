const fs = require('fs');
const {
  join
} = require('path');
const {
  promisify
} = require('util')
const readdir = promisify(fs.readdir),
  unlink = promisify(fs.unlink),
  writeFile = promisify(fs.writeFile),
  mkdir = promisify(fs.mkdir)

const {
  parse
} = require("node-html-parser")
const {
  default: fetch
} = require('node-fetch');

const DISCORD_URL = "https://discordapp.com/"
const OUT_DIR = join(__dirname, 'discord-modules')
global.window = global
global.document = {
  createElement: function() {
    return Object.defineProperty({}, "src", {
      set: function(path) {
        EvalURL(DISCORD_URL + path).catch(() => /* Probably tried to load /assets/undefined.js from line 49*/ null)
      }
    })
  }
}
const webpackJsonp = []
webpackJsonp.push = function ([, modules]) {
  for (const [id, source] of Object.entries(modules))
    writeFile(join(OUT_DIR, `${id}.js`), source.toString())
  return 0
}
global.alert = function(...args) { console.log("Alert:", ...args)}
Object.defineProperty(global, "webpackJsonp", {
  get: function () {
    return webpackJsonp
  },
  // When the WebpackRequire file is evaled
  set: function(val) {
    const n = val.push([[], { "_": (m, _, n) => m.exports = n }, ["_"]])
    for (let i = 0; i < 500; i++) {
      try {
        n.e(i)
      } catch {}
    }
  }
})

function EvalURL(url) {
  return fetch(url.replace(/([^:])\/\//, '$1/')).then(res => res.text()).then(js => eval(js))
}

readdir(OUT_DIR)
.then(files => Promise.all(files.filter(file => file !== "fetch.js").map(file => unlink(join(OUT_DIR, file)))))
.catch(err => err.code = "ENOENT" ? mkdir(OUT_DIR) : undefined)
  .then(() => fetch(DISCORD_URL +'activity'))
  .then(res => res.text())
  .then(parse)
  .then(root => {
    if (!("tagName" in root)) return
    root.querySelectorAll('body script').filter(el => el.attributes.src).forEach(el => EvalURL(DISCORD_URL + el.attributes.src))
  })