const { render } = require('node-sass')
const { join, dirname, basename } = require('path')
const { watch, writeFile, readdirSync } = require('fs')
const btoa = require("btoa")

const IN = join(__dirname, '../styles/')
const OUT = join(__dirname, '../../assets/styles/')


function CompileAll() {
  console.log("Compiling...")
  for (const file of readdirSync(IN).filter(file => file.endsWith('.scss'))) {
    const path = join(IN, file)
    render({
      file: path,
      outFile: path,
      sourceMap: true,
      outputStyle: "compressed"
    }, (err, result) => {
      if (err) return console.error(err);
      const SourceMap = JSON.parse(result.map.toString());
      SourceMap.sources = SourceMap.sources.map(source => "file:///" + join(IN, source));
      writeFile(
        join(OUT, basename(file, '.scss') + '.css'),
        Buffer.concat([result.css, Buffer.from("\n/*# sourceMappingURL=data:application/json;base64," + btoa(JSON.stringify(SourceMap)) +" */")]),
        err => { if (err) console.error(err); }
      );
    })
  }
}

let timeout
watch(dirname(IN), {
  recursive: true
}, (event, filename) => {
  if (!filename.endsWith('scss')) return
  timeout = timeout || setTimeout(() => (timeout = 0, CompileAll()), 100)
})

CompileAll()