import axios from 'axios'
import fs from 'fs'

/**
 *
 * @param {string} url url
 * @param {string} fileName file name
 */
export default async function (url, fileName) {
  let { data } = await axios({
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    responseType: 'arraybuffer'
  })
  await fs.promises.writeFile(fileName, data)
}
