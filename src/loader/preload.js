console.log("***** PRELOAD LOADING *****")
const path = require('path')
const fs = require('fs-extra')
const Promise = require('bluebird')
const resolve = require('resolve')

const { getCurrentWebContents } = require('electron').remote
const { ipcRenderer, remote } = require('electron')

console.log("Engine being loaded")
const conf = fs.existsSync(path.join(__dirname, '..', 'config.json'))
	? require(path.join(__dirname, '..', 'config.json'))
	: {}


// stage zero
// load original preload script if there is one
const DI_ORIG_PRELOAD = ipcRenderer.sendSync('di', 'preload')
console.log("DI_ORIG_PRELOAD", DI_ORIG_PRELOAD)
if (DI_ORIG_PRELOAD) {
	require(DI_ORIG_PRELOAD)
}

// stage one
// post launch patching
process.once('loaded', async () => {
	//const ls = window.localStorage
	//await util.webpackAvailable()

	while (!window.webpackJsonp) {
		await Promise.delay(1000)
	}

	console.log("webpackJsonp found")
	const gWindow = remote.getCurrentWindow()
	
	gWindow.webContents.on('did-finish-load', () => {
		const TwitchCord = require('../twitchcord')

		/*
		appmount = document.getElementById('app-mount')
		api.injectCSS('tcmain', fs.readFileSync(__dirname + "/../../resources/twitchcord.css"))
		*/
		global.twitchcord = new TwitchCord()
		twitchcord.enable()
	})
})
