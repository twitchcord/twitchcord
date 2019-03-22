const { render } = require('node-sass')
const { join, dirname } = require('path')
const { watch, writeFile } = require('fs')

const IN = join(__dirname, '../styles/main.scss')
const OUT = join(__dirname, '../../assets/styles/main.css')

function CompileSass() {
  console.log("Compiling...")
  render({
    file: IN,
    outFile: OUT,
    sourceMapEmbed: true,
    outputStyle: "compressed"
  }, (err, result) => {
    if (err) return console.error(err)
    writeFile(OUT, result.css.toString(), function() {})
  })
}
let timeout
watch(dirname(IN), {
  recursive: true
}, (event, filename) => {
  if (!filename.endsWith('scss')) return
  timeout = timeout || setTimeout(() => (timeout = 0, CompileSass()), 100)
})

CompileSass()