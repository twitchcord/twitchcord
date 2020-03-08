const fs = require('fs')
const path = require('path')
const Extension = require('./extension')
const api2 = require('../api/api2')

module.exports = class ExtensionManager {
    constructor(extensionPath) {
        this.extensionPathRoots = [path.resolve(extensionPath, 'core/'), path.resolve(extensionPath, 'community/')]
        this.extensions = []
        console.log("ROOTS:" + this.extensionPathRoots)
        // TEMP
        global.tc = api2
    }

    loadAll() {
        this.extensionPathRoots.forEach(extensionPath => {
            fs.readdirSync(extensionPath).forEach(extensionDir => this.load(path.resolve(extensionPath, extensionDir))) 
        });
    }

    enableAll() {
        this.extensions.forEach(extension => extension.enable())
    }
    
    load(extensionPath) {
        console.log("Load extension " + extensionPath)
    
        this.extensions.push(new Extension(extensionPath))
    }
}
