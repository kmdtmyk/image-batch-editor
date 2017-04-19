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
  
}