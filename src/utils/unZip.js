import JSZip from 'jszip'

export default function (zipData, thisObj, callBack) {
  let fileDatas = []
  let index = 0

  console.log('开始解压----------')

  JSZip.loadAsync(zipData).then(function (zip) {
    for (var fileName in zip.files) {
      var data = zip.file(fileName).async('arraybuffer')
      fileDatas.push({
        name: fileName,
        data: data
      })
    }
    fileDatas.length && parseZipFile(fileDatas[(index = 0)], parseZipFileEnd)
  })

  function parseZipFile(fileData, callBack) {
    fileData.data.then(function (text) {
      callBack(text)
    })
  }

  function parseZipFileEnd(text) {
    fileDatas[index].data = text
    ++index < fileDatas.length ? parseZipFile(fileDatas[index], parseZipFileEnd) : (callBack.apply(thisObj, [fileDatas]), console.log('解压文件结束------'))
  }
}
