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

  static clip(image, left, top, width, height){
    width = Math.min(image.width - left, width)
    height = Math.min(image.height - top, height)
    var canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    var context = canvas.getContext('2d')
    context.drawImage(image, left, top, width, height, 0, 0, width, height)
    return canvas.toDataURL()
  }

  static rescale(image, width, height){
    width = width || image.width
    height = height || image.height
    var canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    var context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
    return canvas.toDataURL()
  }

}
