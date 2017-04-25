const fs = global.require('fs-extra')
import path from 'path'

export default class{

  static writeFileBase64(base64, filename){
    var base64Data = base64.replace(/^data:image\/png;base64,/, '')
    return new Promise((resolve) => {
      fs.outputFile(filename, base64Data, 'base64', function(err){
        if(err){
          throw err
        }
        resolve(path.resolve(global.process.cwd(), filename))
      })
    })
  }

  static async fileToImage(file){
    var base64 = await this.fileToBase64(file)
    var image = new Image()
    image.src = base64
    return new Promise((resolve) => {
      image.onload = (e) => {
        resolve(image)
      }
    })
  }

  static fileToBase64(file){
    var reader = new FileReader()
    reader.readAsDataURL(file)
    return new Promise((resolve) => {
      reader.onload = (e) => {
        resolve(e.target.result)
      }
    })
  }

}
