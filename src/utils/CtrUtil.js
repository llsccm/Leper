import fs from 'fs'
import Byte from './Byte.js'

export default class CtrUtil {
  /** @type {CtrUtil | null} */
  static Ctr = null
  constructor() {
    this.pointer = Math.pow(2, 14)
    this.blockPointer = 0
    this.keySize = 256
    this.ARRAYBUFFER_ID = 0
    this.STRING_ID = 1
    this.ID_OFFSET = -8
    this.ARRAYBUFFERVIEW = 1 << 0
    this.ARRAY = 1 << 1
    this.STATICARRAY = 1 << 2
    this.VAL_ALIGN_OFFSET = 6
    this.ARRAYBUFFERVIEW_DATASTART_OFFSET = 4
    this.ARRAY_LENGTH_OFFSET = 12
    this.ARRAYBUFFERVIEW_SIZE = 12
    this.ARRAY_SIZE = 16
    this.SIZE_OFFSET = -4
    this.VAL_SIGNED = 1 << 11
    this.VAL_FLOAT = 1 << 12
    this.VAL_MANAGED = 1 << 14
    this.ARRAYBUFFERVIEW_BUFFER_OFFSET = 0
    this.ARRAYBUFFERVIEW_DATASTART_OFFSET = 4
    this.ARRAYBUFFERVIEW_DATALENGTH_OFFSET = 8
    this.STRING_DECODE_THRESHOLD = 32
  }
  Init(key, iv, instance) {
    this.instance = instance.exports
  }
  Reset() {
    if (this.instance) {
      this.instance.e([0], [0], this.keySize)
      this.instance.f([0], [0], this.keySize)
    }
  }
  Encrypt(data) {
    var uint8 = new Uint8Array(data)
    this.loadData(uint8)
    this.enc(this.blockPointer, uint8.length)
    return this.byteView.subarray(this.blockPointer, this.blockPointer + uint8.length).slice()
  }
  Decrypt(data) {
    var uint8 = new Uint8Array(data)
    this.loadData(uint8)
    this.dec(this.blockPointer, uint8.length)
    return this.byteView.subarray(this.blockPointer, this.blockPointer + uint8.length).slice()
  }
  Ofb_Dec(data) {
    var uData = new Byte()
    var len = data.byteLength
    uData.writeArrayBuffer(data)
    var count = 16 - (len % 16)
    uData.length = count + len
    var value = new Uint8Array(uData.buffer)
    var arrPtr = this.instance.__retain(this.__newArray(this.instance.Uint8Array_ID, value))
    var constru = this.instance['CFBDecryptor#constructor'](0, [0], [0], 16)
    var start = this.instance['CFBDecryptor#decrypt'](constru, arrPtr)
    this.instance.__release(arrPtr)
    var arry = this.__getArray(start)
    this.instance.__release(start)
    return arry.slice(0, len)
  }
  loadData(data) {
    this.byteView.set(data, this.blockPointer)
  }
  staticMalloc(size) {
    this.pointer += size
    return this.pointer - size
  }
  __getArray(arr) {
    var input = this.__getArrayView(arr)
    var len = input.length
    var out = new Array(len)
    for (var i = 0; i < len; i++) {
      out[i] = input[i]
    }
    return out
  }
  __getArrayView(arr) {
    var U32 = this.meBuffer
    var id = U32[(arr + this.ID_OFFSET) >>> 2]
    var info = this.getArrayInfo(id)
    var align = this.getValueAlign(info)
    var buf = info & this.STATICARRAY ? arr : U32[(arr + this.ARRAYBUFFERVIEW_DATASTART_OFFSET) >>> 2]
    var length = info & this.ARRAY ? U32[(arr + this.ARRAY_LENGTH_OFFSET) >>> 2] : U32[(buf + this.SIZE_OFFSET) >>> 2] >>> align
    return this.getView(align, info & this.VAL_SIGNED, info & this.VAL_FLOAT).subarray((buf >>>= align), buf + length)
  }
  getArrayInfo(id) {
    var info = this.getInfo(id)
    if (!(info & (this.ARRAYBUFFERVIEW | this.ARRAY | this.STATICARRAY))) {
    }
    return info
  }
  getInfo(id) {
    var U32 = this.meBuffer
    var rttiBase = this.instance['__rtti_base'] || ~0
    var count = U32[rttiBase >>> 2]
    if ((id >>>= 0) >= count) {
    }
    return U32[((rttiBase + 4) >>> 2) + id * 2]
  }
  getValueAlign(info) {
    return 31 - Math.clz32((info >>> this.VAL_ALIGN_OFFSET) & 31)
  }
  getView(alignLog2, signed, float) {
    var buffer = this.buffer
    if (float) {
      switch (alignLog2) {
        case 2:
          return new Float32Array(buffer)
        case 3:
          return new Float64Array(buffer)
      }
    } else {
      switch (alignLog2) {
        case 0:
          return new (signed ? Int8Array : Uint8Array)(buffer)
        case 1:
          return new (signed ? Int16Array : Uint16Array)(buffer)
        case 2:
          return new (signed ? Int32Array : Uint32Array)(buffer)
        case 3:
          return new (signed ? BigInt64Array : BigUint64Array)(buffer)
      }
    }
    throw Error('')
  }
  __getString(ptr) {
    var buffer = this.buffer
    var id = new Uint32Array(buffer)[(ptr + this.ID_OFFSET) >>> 2]
    if (id !== this.STRING_ID) {
    }
    return this.getStringImpl(buffer, ptr)
  }
  getStringImpl(buffer, ptr) {
    var decoder = new TextDecoder('utf-16le')
    var len = new Uint32Array(buffer)[(ptr + this.SIZE_OFFSET) >>> 2] >>> 1
    var arr = new Uint16Array(buffer, ptr, len)
    if (len <= this.STRING_DECODE_THRESHOLD) {
      return String.fromCharCode.apply(String, arr)
    }
    return decoder.decode(arr)
  }
  __newArray(id, values) {
    var new_ = this.instance['__new']
    var retain = this.instance['__retain']
    var info = this.getArrayInfo(id)
    var align = this.getValueAlign(info)
    var length = values.length
    var buf = new_(length << align, info & this.STATICARRAY ? id : this.ARRAYBUFFER_ID)
    var result
    if (info & this.STATICARRAY) {
      result = buf
    } else {
      var arr = new_(info & this.ARRAY ? this.ARRAY_SIZE : this.ARRAYBUFFERVIEW_SIZE, id)
      var U32 = this.meBuffer
      U32[(arr + this.ARRAYBUFFERVIEW_BUFFER_OFFSET) >>> 2] = retain(buf)
      U32[(arr + this.ARRAYBUFFERVIEW_DATASTART_OFFSET) >>> 2] = buf
      U32[(arr + this.ARRAYBUFFERVIEW_DATALENGTH_OFFSET) >>> 2] = length << align
      if (info & this.ARRAY) U32[(arr + this.ARRAY_LENGTH_OFFSET) >>> 2] = length
      result = arr
    }
    var view = this.getView(align, info & this.VAL_SIGNED, info & this.VAL_FLOAT)
    if (info & this.VAL_MANAGED) {
      for (var i = 0; i < length; ++i) {
        view[(buf >>> align) + i] = retain(values[i])
      }
    } else {
      view.set(values, buf >>> align)
    }
    return result
  }
  static Init() {
    if (!WebAssembly) return
    if (CtrUtil.Ctr) return

    const wasmBuffer = fs.readFileSync('./src/utils/decrypt.wasm')

    var key_1 = [0]
    var iv_1 = [0]
    const env = {
      memory: new WebAssembly.Memory({
        initial: 256,
        maximum: 256
      }),
      STACKTOP: 0,
      abort: function abort() {},
      seed: Date.now
    }

    WebAssembly.instantiate(wasmBuffer, { env })
      .then((result) => {
        var encryUtil = new CtrUtil()
        CtrUtil.Ctr = encryUtil
        encryUtil.blockPointer = encryUtil.staticMalloc(0)
        encryUtil.byteView = new Uint8Array(env.memory.buffer)
        encryUtil.buffer = env.memory.buffer
        encryUtil.meBuffer = new Uint32Array(result.instance.exports.memory.buffer)
        encryUtil.Init(key_1, iv_1, result.instance)
      })
      .catch((e) => {
        console.log('解析失败:' + e)
      })
  }
}
