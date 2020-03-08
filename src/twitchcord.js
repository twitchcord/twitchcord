const fs = require('fs-extra')
const api = require('./api/core.js')
const EventEmitter = require('events');
const ExtensionManager = require('./lib/extensionmanager')
const DataAttr = require('./lib/dataattr')

module.exports = class TwitchCord extends EventEmitter {
    constructor() {
        super()
        this.manager = new ExtensionManager(__dirname + '/../extensions/')
    }

    enable() {
		// TODO: Add a setting for enabling data attribtues

		// Enable data attributes
		var dataattr = new DataAttr()
		dataattr.hookDataAttributes()
		console.log("Data attributes hooked\n")
		
    this.manager.loadAll()
    this.manager.enableAll()
		//api.injectCSS('tcmain', fs.readFileSync(__dirname + "/../extensions/core/twitchcord/twitchcord.css"))
    }
}
