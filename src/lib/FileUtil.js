const fs = global.require('fs-extra')
const del = global.require('del')

export default class{

  static async toImage(file){
    var base64 = await this.toBase64(file)
    var image = new Image()
    image.src = base64
    return new Promise((resolve) => {
      image.onload = (e) => {
        resolve(image)
      }
    })
  }

  static toBase64(file){
    var reader = new FileReader()
    reader.readAsDataURL(file)
    return new Promise((resolve) => {
      reader.onload = (e) => {
        resolve(e.target.result)
      }
    })
  }

  static deleteSync(path){
    del.sync(path)
  }

}
