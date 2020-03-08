const util = require('./installutil')
const path = require('path')
const fs = require('fs-extra')
const { spawn } = require('child_process')
const os = require('os')

const packageTemplate = {
  name: 'Twitchcord-Loader',
  version: '1.0.0',
  description:
    'Twitchcord is a discord extension',
  main: 'index.js',
  scripts: {},
  author: 'BakedPVP and Catch22',
  license: 'MIT',
  repository: 'https://github.com/twitchcord/twitchcord',
  dependencies: {}
}

const indexTemplate = basePath => {
	basePath = path.resolve(basePath, '../..')
	return `require('${basePath.replace(/\\/g, '/')}').inject(__dirname)`
}

function launchClient (exe) {
  // start application detached from main process, ignore any stdio and unref
  spawn(exe, { detached: true, stdio: 'ignore' }).unref()
}

async function closeClient (proc) {
  if (proc.pid.length === 0) return true

  if (process.platform === 'linux') {
    const exe = path.basename(proc.command)
    return new Promise(resolve => {
      // weird linux behavior not being able to kill the electron tree
      spawn('killall', [exe]).on('exit', () => {
        spawn('killall', [exe]).on('exit', resolve)
      })
    })
  } else {
    for (let pid of proc.pid) {
      // dont try..catch, let exceptions fall through
      process.kill(pid)
    }
  }
}

async function injectClient (base) {
  const app =
    process.platform === 'darwin'
      ? path.join(base, '..', '..', 'Resources', 'app')
      : path.join(base, 'app')
  if (fs.existsSync(path.join(app, 'package.json'))) {
    throw new Error(`some kind of injector is already installed in <${app}>`)
  }

  // check for permissions
  try {
    fs.accessSync(path.dirname(app), fs.constants.W_OK)
  } catch (err) {
    // we dont have permissions, elevate and return!

    const tmp = path.join(fs.realpathSync(os.tmpdir()), 'injector.js')
    console.log('Elevating permissions to access', path.dirname(app))
    fs.writeFileSync(
      tmp,
      `
    const fs = require("fs")
    const path = require("path")
    const app = "${app}"
    fs.mkdirSync(app)

    // create required injector files
    fs.writeFileSync(
      path.join(app, "package.json"),
      \`${JSON.stringify(packageTemplate, null, 2)}\`
    )
    fs.writeFileSync(path.join(app, "index.js"), \`${indexTemplate(
      __dirname
    )}\`)
    `
    )

    return new Promise(resolve =>
      spawn('sudo', [process.argv0, tmp], { stdio: 'inherit' }).on(
        'exit',
        resolve
      )
    )
  }

  fs.ensureDirSync(app)

  // create required injector files
  fs.writeFileSync(
    path.join(app, 'package.json'),
    JSON.stringify(packageTemplate, null, 2)
  )
  fs.writeFileSync(path.join(app, 'index.js'), indexTemplate(__dirname))
}

async function inject (proc, reinstall = false) {
  const appPath = path.join(proc.command, '..', 'resources')

  if (proc.pid.length > 0 && !reinstall) {
    console.log('closing client...')
    await closeClient(proc)
  }

  console.log('creating injector...')
  await injectClient(appPath)

  if (proc.pid.length > 0) {
    console.log('restarting client...')
    await launchClient(proc.command)
  }

  console.log('installed di successfully')
}

async function uninject (proc, reinstall = false) {
  const appPath =
    process.platform === 'darwin'
      ? path.join(proc.command, '..', '..', 'Resources', 'app')
      : path.join(proc.command, '..', 'resources', 'app')

  if (proc.pid.length > 0) {
    console.log('closing client...')
    await closeClient(proc)
  }

  console.log('purging injector...')
  await fs.removeSync(appPath)

  if (proc.pid.length > 0 && !reinstall) {
    console.log('restarting client...')
    await launchClient(proc.command)
  }

  console.log('uninstalled di successfully')
}

async function main (args) {
  const interactive = !args.includes('-s')
  const procs = await util.getDiscordProcess()
  let p

  switch (Object.values(procs).length) {
    case 1:
      p = Object.values(procs).shift()
      break

    // no processes found, fall back to manual mode
    case 0:
      if (!interactive) throw new Error('no discord process found')
      p = {
        command: await util.readString(
          'Enter the path to the discord executeable: '
        ),
        pid: []
      }
      break

    default:
      if (!interactive) throw new Error('to many discord processes found')

      const id = await util.readMultipleChoice(
        'Please choose your process from the list:\n' +
          Object.values(procs)
            .map(
              (p, idx) => `  [${idx + 1}] ${p.command} (${p.pid.join(', ')})`
            )
            .join('\n'),
        Object.values(procs).map((_, idx) => `${idx + 1}`)
      )
      p = Object.values(procs)[id - 1]
  }

  switch (args[2]) {
    case 'inject':
      await inject(p)
      break
    case 'uninject':
      await uninject(p)
      break
    case 'reinject':
      await uninject(p, true)
      await inject(p, true)
      break

    default:
      console.error(
        'Invalid command, valid commands are: inject, uninject, reinject'
      )
      return 1
  }
}
main(process.argv).then(errCode => process.exit(errCode)).catch(err => {
  console.error(err)
  process.exit(128)
})
