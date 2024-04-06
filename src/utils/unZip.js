import JSZip from 'jszip'

export default function (zipData, thisObj, callBack) {
  let fileDatas = []
  // let index = 0

  console.log('开始解压----------')

  JSZip.loadAsync(zipData).then(async function (zip) {
    for (let fileName in zip.files) {
      let data = await zip.file(fileName).async('arraybuffer')
      fileDatas.push({
        name: fileName,
        data: data
      })
    }
    // fileDatas.length && parseZipFile(fileDatas[(index = 0)], parseZipFileEnd)
    if (fileDatas.length) {
      console.log('解压文件结束------')
      callBack.apply(thisObj, [fileDatas])
    } else {
      console.log('解压文件失败------')
    }
  })

  // function parseZipFile(fileData, callBack) {
  //   fileData.data.then(function (text) {
  //     callBack(text)
  //   })
  // }

  // function parseZipFileEnd(text) {
  //   fileDatas[index].data = text
  //   ++index < fileDatas.length ? parseZipFile(fileDatas[index], parseZipFileEnd) : (callBack.apply(thisObj, [fileDatas]), console.log('解压文件结束------'))
  // }
}
