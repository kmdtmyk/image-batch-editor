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

  static resize(image, width, height){
    width = width || image.width
    height = height || image.height
    var canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    var context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
    return canvas.toDataURL()
  }

  static split(image, width, height){
    width = Math.max(width, 0) || image.width
    height = Math.max(height, 0) || image.height
    var result = []
    var top = 0
    do{
      var left = 0
      do{
        var base64 = this.clip(image, left, top, width, height)
        result.push(base64)
        left += width
      }while(left < image.width)
      top += height
    }while(top < image.height)
    return result
  }

  static divide(image, col, row){
    col = Math.max(col, 1)
    row = Math.max(row, 1)
    var width = image.width / col
    var height = image.height / row
    var result = []
    for(var i = 0; i < row; i++){
      for(var j = 0; j < col; j++){
        var left = width * j
        var top = height * i
        var base64 = this.clip(image, left, top, width, height)
        result.push(base64)
      }
    }
    return result
  }

}
