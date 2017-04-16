<template>
  <div style='height: 100%;'>
    <div>
      <div>
        <label>
          <input type='radio' v-model='options.mode' value='size'>分割サイズで指定
        </label>
      </div>
      <div>
        <label>高さ</label>
        <input type='number' v-model.number='options.size.height'>px
      </div>
      <div>
        <label>幅</label>
        <input type='number' v-model.number='options.size.width'>px
      </div>
    </div>

    <div>
      <div>
        <label>
          <input type='radio' v-model='options.mode' value='number'>分割数で指定
        </label>
      </div>
      <div>
        <label>縦</label>
        <input type='number' v-model.number='options.number.vertical'>個
      </div>
      <div>
        <label>横</label>
        <input type='number' v-model.number='options.number.horizontal'>個
      </div>
    </div>

    <div>
      <label>画像</label>
      <input type='file' @change='onFileChange' multiple>
    </div>

    <div>
      <button type='button' v-on:click='run'>実行</button>
    </div>

    <div>
      <progress v-bind:value='progress' v-bind:max='files.length'></progress>
      <span>{{progress}} / {{files.length}}</span>
    </div>

    <div v-for='result in results' class='result' contenteditable>
      <div v-for='row in result'>
        <img :src='image' v-for='image in row'>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data(){
    return {
      options: {
        mode: 'size',
        size: {
          width: 100,
          height: 200,
        },
        number: {
          vertical: 2,
          horizontal: 3,
        },
      },
      results: [],
      files: [],
      progress: 0,
    }
  },
  methods: {
    async run(){
      if(!this.files){
        return
      }
      this.clear()
      var results = []
      for(var file of this.files){
        results.push(await divide(file, this.options))
        this.progress += 1
      }
      this.results = results
    },
    onFileChange(e){
      this.clear()
      this.files = e.target.files || e.dataTransfer.files
    },
    clear(){
      this.progress = 0
      this.results = []
    }
  }
}

async function divide(file, options){
  var base64 =  await createImage(file)
  const mode = options.mode
  if(mode === 'size'){
    var {result, size} = await divideBySize(base64, options.size)
  }else if(mode === 'number'){
    var {result, size} = await divideByNumber(base64, options.number)
  }
  return _.chunk(result, size.col)
}

function createImage(file){
  var reader = new FileReader()
  reader.readAsDataURL(file)
  return new Promise((resolve) => {
    reader.onload = (e) => {
      resolve(e.target.result)
    }
  })
}

function divideBySize(base64, options){
  var sizeWidth = Math.max(options.width, 0)
  var sizeHeight = Math.max(options.height, 0)
  var image = new Image()
  image.src = base64
  return new Promise((resolve) => {
    image.onload = (e) => {
      if(!sizeWidth){
        sizeWidth = image.width
      }
      if(!sizeHeight){
        sizeHeight = image.height
      }
      var result = []
      var top = 0
      do{
        var left = 0
        do{
          var base64 = clipImage(image, left, top, sizeWidth, sizeHeight)
          result.push(base64)
          left += sizeWidth
        }while(left < image.width)
        top += sizeHeight
      }while(top < image.height)
      var col = Math.ceil(image.width / sizeWidth)
      var row = Math.ceil(image.height / sizeHeight)
      var size = {col, row}
      resolve({result, size})
    }
  })
}

function divideByNumber(base64, options){
  var vertical = Math.max(options.vertical, 1)
  var horizontal = Math.max(options.horizontal, 1)
  var image = new Image()
  image.src = base64
  return new Promise((resolve) => {
    image.onload = (e) => {
      var width = image.width
      var height = image.height
      var sizeWidth = width / horizontal
      var sizeHeight = height / vertical
      var result = []
      for(var i = 0; i < vertical; i++){
        for(var j = 0; j < horizontal; j++){
          var left = sizeWidth * j
          var top = sizeHeight * i
          var base64 = clipImage(image, left, top, sizeWidth, sizeHeight)
          result.push(base64)
        }
      }
      var col = horizontal
      var row = vertical
      var size = {col, row}
      resolve({result, size})
    }
  })
}

function clipImage(image, left, top, width, height){
  width = Math.min(image.width - left, width)
  height = Math.min(image.height - top, height)
  var canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  var context = canvas.getContext('2d')
  context.drawImage(image, left, top, width, height, 0, 0, width, height)
  return canvas.toDataURL()
}
</script>

<style>
html, body, body > div{
  height: 100%;
}

img{
  margin: 5px;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.4);
  line-height: 0;
}

.result{
  border: 1px solid black;
  overflow: scroll;
  max-height: 97%;
  margin-bottom: 10px;
}

.result > div{
  display: flex;
}
</style>