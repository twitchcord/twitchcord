const Promise = require('bluebird')
const fs = require('fs')
const ps = Promise.promisifyAll(require('ps-node'))
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

Object.assign(exports, {
  async getDiscordProcess () {
    // fetch discord related processes
    const list = (await ps.lookupAsync({ psargs: 'alx' }))
      .filter(p => p.command.toLowerCase().includes('discord'))
      .map(p => {
        let command = p.command
        while (!fs.existsSync(command)) {
          command += ' ' + p.arguments.shift()
        }
        p.command = command
        return p
      })
    const procs = {}
    list.forEach(p => {
      if (!procs[p.command]) procs[p.command] = { command: p.command, pid: [] }
      procs[p.command].pid.push(p.pid)
    })

    return procs
  },

  readString (query) {
    return new Promise(resolve => rl.question(query, resolve))
  },

  async readMultipleChoice (query, allowedValues) {
    let answer = await exports.readString(query + '\nInput: ')
    while (!allowedValues.includes(answer.trim())) {
      answer = await exports.readString('Invalid option, retry: ')
    }

    return answer
  }
})
