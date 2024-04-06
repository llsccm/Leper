import zlib from 'zlib'
import Byte from './utils/Byte.js'
import CtrUtil from './utils/CtrUtil.js'
// import { gunzipSync } from './utils/zlib.cjs'
import fs from 'fs'
import unZip from './utils/unZip.js'

export default class Config {
  constructor() {
    this.initConfigerList()
    CtrUtil.Init()
    try {
      fs.mkdirSync('./dist/config', { recursive: true })
    } catch (error) {
      console.error('创建目录失败:', error)
    }
  }

  preloadConfigerList = []
  initConfigerList() {
    this.preloadConfigerList.length = 0
    this.preloadConfigerList = ['gn_dbs_quest', 'ff_exchange_new', 'ff_dbs_lottery_new', 'sys_treasure_chest']
  }

  ParsePreloadConfig(data) {
    unZip(data, this, function (zipFiles) {
      this.zipFiles = zipFiles

      if (this.zipFiles && this.zipFiles.length) {
        this.parseConfig()
      } else {
        console.log('解压Config.sgs异常')
      }
    })
  }

  configLen = 0
  parseIndex = 0
  workerList = []
  parseConfig() {
    this.configLen = this.preloadConfigerList.length
    this.parseIndex = 0
    let length = (this.configLen = this.preloadConfigerList.length)

    for (let i = 0; i < length; i++) {
      let configName = this.preloadConfigerList[i]
      let data = this.WorkParse(this.getZipConfigData(configName))
      try {
        fs.writeFileSync(`./dist/config/${configName}.json`, data)
        console.log(`解析配置${configName}`)
      } catch (error) {
        console.log(err)
      }
    }
  }

  getZipConfigData(configName) {
    let name = configName + '.sgs'

    if (this.zipFiles?.length) {
      let len = this.zipFiles.length

      for (let i = 0; i < len; i++) {
        if (this.zipFiles[i].name == name) {
          return this.zipFiles[i].data
        }
      }
    }

    return null
  }
  /**
   *
   * @param {ArrayBuffer} data zip data
   * @returns {string} config data
   */
  WorkParse(data) {
    if (!data || !(data instanceof ArrayBuffer)) {
      console.log('配置解析出错：')
      return ''
    }

    if (!this.crypt) this.crypt = CtrUtil.Ctr

    let baseData = this.crypt.Ofb_Dec(data)
    // let plain = gunzipSync(baseData)
    let plain = zlib.gunzipSync(Buffer.from(baseData))
    const arrayBuffer = plain.buffer.slice(plain.byteOffset, plain.byteOffset + plain.byteLength)

    let temp = new Byte()
    temp.endian = Byte.LITTLE_ENDIAN
    temp.writeArrayBuffer(arrayBuffer)
    temp.pos = 0
    let res = temp.readUTFBytes()
    return res
  }
}
