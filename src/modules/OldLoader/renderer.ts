const G = global as any

G['require'] = require
G['process'] = process
G['global'] = G

require('./old-core').load()