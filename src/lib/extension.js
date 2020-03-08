const ManifestFile = 'plugin.json'
const fs = require('fs')
const path = require('path')
const api = require('../api')

module.exports = class Extension {
    constructor(extensionPath) {
        this.path = extensionPath
        this.name = this.path
        this.isLoaded = false
        this.isEnabled = false
        this.api = api // debug
        this.load()
    }

    log(...msg) {
        console.log("Twitchcord plugin", this.name, ": ", ...msg)
    }
    load() {
        // load manifest
        var manifestPath = path.resolve(this.path, ManifestFile)
        this.manifest = JSON.parse(fs.readFileSync(manifestPath))

        // verify manifest
        if (!this.manifest.name ||
            !this.manifest.version ||
            !this.manifest.readme) {
                // log an error
                this.log("Required fields missing in " + manifestPath)
                return
        }

        // TODO: Slugify the name
        this.name = this.manifest.name

        try {
            // Load CSS file
            if (this.manifest.style) {
                this.style = this.compileCSS(this.manifest.style)
                fs.watchFile(path.resolve(this.path, this.manifest.style) , (curr, prev) => {
                    this.style = this.compileCSS(this.manifest.style)
                    if (this.isEnabled) {
                        api.core.removeCSS(this.manifest.name)
                        api.core.injectCSS(this.manifest.name, this.style)
                    }
                })
            }
        } catch(e) {
            this.log("error loading styles", e)
            return
        }
    
        // Load the plugin script if preset
        if (this.manifest.script) {
            try {
                // Call the init code
                var pluginPath = path.resolve(this.path, this.manifest.script)
                this.extensionScript = require(pluginPath)
            } catch(e) {
                this.log("error loading plugin script", pluginPath, e)
                this.log("Stack:",e.stack)
                return
            }
        }
    }

    enable() {
        // Add styles
        if (this.style) {
            // Inject the CSS
            api.core.injectCSS(this.manifest.name, this.style)
        }
        this.isEnabled = true
        // start init code
        if (this.extensionScript) {
            try {
                this.extensionScript.start()
            } catch(e) {
                // Log error
                this.log("Error enabling extension", this.path, e)
                return
            }
            this.log("Extension loaded successfully", this.path)
        }
    }

    compileCSS(cssPath, scss = false) {
        // TODO: compile the SCSS
        return fs.readFileSync(path.resolve(this.path, cssPath))
    }
}
