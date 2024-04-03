// import GBK from 'gbk.js'
import Byte from './Byte.js'

export default class ByteArray extends Byte {
  constructor(data) {
    super(data)
  }
  writeShort(value) {
    this.writeInt16(value)
  }
  readShort() {
    return this.getInt16()
  }
  writeUnsignedInt(value) {
    this.writeUint32(value)
  }
  readUnsignedInt() {
    return this.getUint32()
  }
  readUnsignedShort() {
    return this.getUint16()
  }
  writeUnsignedShort(val) {
    this.writeUint16(val)
  }
  writeInt(value) {
    this.writeInt32(value)
  }
  readInt() {
    return this.getInt32()
  }
  writeBoolean(value) {
    this.writeByte(value ? 1 : 0)
  }
  readBoolean() {
    return this.readByte() != 0
  }
  readUnsignedByte() {
    return this.getUint8()
  }
  writeUnsignedByte(value) {
    this.writeUint8(value)
  }
  writeDouble(value) {
    this.writeFloat64(value)
  }
  readDouble() {
    return this.getFloat64()
  }
  writeBytes(bytes, offset = 0, length = 0) {
    if (offset < 0 || length < 0) throw new Error('writeBytes error - Out of bounds')
    if (length == 0) length = bytes.length - offset
    this['_ensureWrite'](this._pos_ + length)
    this._u8d_.set(bytes._u8d_.subarray(offset, offset + length), this._pos_)
    this._pos_ += length
  }
  readBytes(bytes, offset = 0, length = 0) {
    if (offset < 0 || length < 0) throw new Error('Read error - Out of bounds')
    if (length == 0) length = this._length - this._pos_
    bytes['_ensureWrite'](offset + length)
    bytes._u8d_.set(this._u8d_.subarray(this._pos_, this._pos_ + length), offset)
    bytes.pos = offset
    this._pos_ += length
    if (bytes.pos + length > bytes.length) bytes.length = bytes.pos + length
  }
  writeStringByLength(value, length) {
    value = value || ''
    var bytes = this.getGBKByteArray(value, length)
    this.writeBytes(bytes)
  }
  writeString(str, sendLength = false) {
    str = str || ''
    var bytes = this.getGBKByteArray(str)
    if (sendLength) {
      this.writeByte(bytes.length)
    }
    this.writeBytes(bytes)
  }
  writeLongString(str) {
    str = str || ''
    var bytes = this.getGBKByteArray(str)
    this.writeInt(bytes.length)
    this.writeBytes(bytes)
    return bytes.length
  }
  readStringByLength(len) {
    var result = ''
    var charCount = 0
    var pos = this.pos
    var byteValue
    for (; charCount < len; charCount++) {
      byteValue = this.readByte()
      if (byteValue == 0) {
        break
      }
    }
    this.pos = pos
    result = this.readGBKStringByLength(length)
    return result
  }
  getUTF8ByteArray(value, len) {
    var bytes = new ByteArray()
    bytes.writeUTFBytes(value)
    var bomPos = this.GetBomPosition(bytes)
    if (bomPos > 0) {
      var bb = new ByteArray()
      bb.pos = bomPos
      bb.readBytes(bytes, bytes.pos, bytes.bytesAvailable)
      bytes = bb
    }
    bytes.pos = bytes.length
    if (bytes.length < len) {
      var index = bytes.length
      for (; index < len; index++) {
        if (index < len - 1) {
          bytes.writeByte(0x00)
        } else {
          bytes.writeByte(0xcc)
        }
      }
    } else if (bytes.length > length) {
      bytes.length = length
    }
    return bytes
  }
  getGBKByteArray(str, len) {
    len = len || 0
    var bytes = new ByteArray()
    var arr = new Uint8Array(GBK.encode(str))
    bytes.writeArrayBuffer(arr.buffer)
    if (bytes.length < len) {
      var index = bytes.length
      for (; index < len; index++) {
        bytes.writeByte(0x00)
      }
    }
    return bytes
  }
  getGBKBuffer(str, _len) {
    var arr = new Uint8Array(GBK.encode(str))
    return arr.buffer
  }
  GetBomPosition(bytes) {
    var curPos = bytes.pos
    bytes.pos = 0
    var bom1 = bytes.bytesAvailable ? bytes.readUnsignedByte() : 0
    var bom2 = bytes.bytesAvailable ? bytes.readUnsignedByte() : 0
    var bom3 = bytes.bytesAvailable ? bytes.readUnsignedByte() : 0
    var pos = 0
    if (bom1 == 0xef && bom2 == 0xbb && bom3 == 0xbf) {
      pos = 3
    } else if (bom1 == 0xfe && bom2 == 0xff) {
      pos = 2
    } else if (bom1 == 0xff && bom2 == 0xfe) {
      pos = 2
    } else if (bom1 == 0x3f) {
      pos = 1
    }
    bytes.pos = curPos
    return pos
  }
  readGBKStringByLength(len) {
    len === void 0 && (len = -1)
    if (len <= 0) return ''
    var lastBytes = this.bytesAvailable
    // var flag = false
    if (len > lastBytes) {
      len = lastBytes
      // flag = true
    }
    var str = this.rGBK(len)
    // if (flag) {
    //   LogManager.GetInstance().SendErrorLog('readGBKStringByLength error - Out of bounds report---len:' + len + '---str:' + str)
    // }
    return str
  }
  rGBK(len) {
    var bytes = new ByteArray()
    this.readBytes(bytes, 0, len)
    let str = GBK.decode(new Uint8Array(bytes.buffer))
    // console.log('@@@',str)
    return str
  }
  static GetGBKStringLength(str) {
    var len = 0
    if (str) {
      len = GBK.encode(str).length
    }
    return len
  }
}
