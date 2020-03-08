// injector script based on https://github.com/joe27g/EnhancedDiscord/blob/beta/advanced_installation.md

const path = require('path')
const fs = require('fs-extra')
const Module = require('module')
const electron = require('electron')
const { BrowserWindow, ipcMain } = electron

const conf = fs.existsSync(path.join(__dirname, 'config.json'))
  ? require(path.join(__dirname, 'config.json'))
  : {}
const preloadPath = path.join(__dirname, './')

process.env.DI_DEBUG_LOG = path.join(__dirname, `debug-${Date.now()}.log`)
fs.removeSync(process.env.DI_DEBUG_LOG)

let DI_ORIG_PRELOAD = null
let gBrowserWindow = null




// patch browser window to use custom options
class PatchedBrowserWindow extends BrowserWindow {
  constructor(originalOptions) {
    console.log("PatchedBrowserWindow originalOptions", originalOptions)
    const options = Object.assign({}, originalOptions)
    options.webPreferences = options.webPreferences || {}

    // options.center is only defined in the splash screen
    if (!options.center) {
      // add transparency support
      if (conf.frame === true) {
        options.frame = true
      } else if (conf.frame === false) {
        if (conf.transparency === true) {
          options.transparent = true
          delete options.backgroundColor
        } else if (conf.transparency === false) {
          options.transparent = false
        }
      }
    }

    DI_ORIG_PRELOAD = options.webPreferences.preload
    options.webPreferences.preload = path.join(preloadPath, 'preload.js')

    console.log("Creating browserWindow preload", options.webPreferences.preload, "DI_ORIG_PRELOAD", DI_ORIG_PRELOAD);
    gBrowserWindow = new BrowserWindow(options);
    console.log(gBrowserWindow)
    return gBrowserWindow;
  }
}

ipcMain.on('di', (ev, arg, arg1) => {
  console.log("ipcMain.on arg", arg)
  if (arg === 'preload') {
    ev.returnValue = DI_ORIG_PRELOAD
  } else if (arg === 'window') {
    ev.returnValue = gBrowserWindow
  } else if (arg === 'log') {
    console.log("renderer> ", arg1)
    ev.returnValue = 0
  }
})


function patchElectron() {
	console.log(1)
	const electronCacheEntry = require.cache[require.resolve('electron')]

	console.log(2)
	Object.defineProperty(electronCacheEntry, 'exports', {
		value: Object.assign({}, electronCacheEntry.exports)
	})
	
	console.log(3)
	electronCacheEntry.exports.BrowserWindow = PatchedBrowserWindow
	console.log("BrowserWindow patched", electron.BrowserWindow)
	console.log(4)
}

electron.app.on('ready', () => {
  console.log("Twitchcord-v3: Electron app is ready")
	patchElectron();
	
  // patch webRequest session to ditch the CSP headers
  electron.session.defaultSession.webRequest.onHeadersReceived(
    (details, done) => {
      const responseHeaders = Object.assign({}, details.responseHeaders)
      // delete the content security response headers
      Object.keys(responseHeaders)
        .filter(k => k.toLowerCase().startsWith('content-security-policy'))
        .forEach(k => delete responseHeaders[k])

      done({ cancel: false, responseHeaders: responseHeaders })
    }
  )

  // patch webRequest session to not ask for source map files
  electron.session.defaultSession.webRequest.onBeforeRequest((details, done) =>
    done({ cancel: details.url.endsWith('.js.map') })
  )
})

// patch command line options
if (conf.chromeFlags && Array.isArray(conf.chromeFlags)) {
  conf.chromeFlags.forEach(flag => {
    const key = Array.isArray(flag) ? flag[0] : flag
    const value = Array.isArray(flag) ? flag[1] : null
    electron.app.commandLine.appendSwitch(key, value)
  })
}

exports.inject = function inject(appPath) {
	console.log("Injector.js loaded")
  const basePath = path.join(appPath, '..', 'app.asar')

  // fetch discord package.json
  const pkg = require(path.join(basePath, 'package.json'))
  console.log("Injecting pkgPath", path.join(basePath, 'package.json'))
  console.log(pkg)
	
  // adjust electron root
  electron.app.getAppPath = () => basePath


  // daisy chain into the original application file
  Module._load(path.join(basePath, pkg.main), null, true)
}
