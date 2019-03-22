const { render } = require('node-sass')
const { join, dirname } = require('path')
const { watch, writeFile } = require('fs')
const btoa = require("btoa")

const IN = join(__dirname, '../styles/main.scss')
const OUT = join(__dirname, '../../assets/styles/main.css')

function CompileSass() {
  console.log("Compiling...")
  render({
    file: IN,
    outFile: IN,
    sourceMap: true,
    outputStyle: "compressed"
  }, (err, result) => {
    if (err) return console.error(err);
    const SourceMap = JSON.parse(result.map.toString());
    SourceMap.sources = SourceMap.sources.map(source => "file:///" + join(dirname(IN), source));
    console.log(JSON.stringify(SourceMap.sources))
    writeFile(
      OUT,
      Buffer.concat([result.css, Buffer.from("\n/*# sourceMappingURL=data:application/json;base64," + btoa(JSON.stringify(SourceMap)) +" */`")]),
      err => { if (err) console.error(err); }
    );
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