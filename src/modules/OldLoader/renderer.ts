const G = global as any

G['require'] = require
G['process'] = process

require('./old-core').load()