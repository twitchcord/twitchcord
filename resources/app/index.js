const { join } = require("path")

const DEV_FOLDER = require("./package.json").config.DEV_FOLDER

require(join(DEV_FOLDER, "node_modules/ts-node")).register()

process.env.DISCORD_APP_ROOT = __dirname
require(join(DEV_FOLDER, "src"))