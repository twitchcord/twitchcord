const { join } = require("path")
process.env.DISCORD_APP_ROOT = __dirname

const DEV_FOLDER = require("./package.json").config.DEV_FOLDER

require(join(DEV_FOLDER, "node_modules/ts-node")).register({
  project: join(DEV_FOLDER, "tsconfig.json")
})

require(join(DEV_FOLDER, "src"))