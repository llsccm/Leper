import fs from 'fs'
import Config from './src/parser.js'
import download from './src/utils/download.js'

const configUrl = 'https://web.sanguosha.com/220/h5_2/res/config/Config_w.sgs'
const fileName = './dist/Config_w.sgs'

const configer = new Config()
await download(configUrl, fileName)
const data = await fs.promises.readFile(fileName)
configer.ParsePreloadConfig(data)

// const data = await fs.promises.readFile(fileName)
// fs.readFile(fileName, function (err, data) {
//   if (err) throw err
//   configer.ParsePreloadConfig(data)
// })
