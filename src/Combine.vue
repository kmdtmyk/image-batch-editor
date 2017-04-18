<template>
  <div style='height: 100%;'>
    <div>
      <label>出力形式</label>
      <label>
        <input type='radio' v-model='options.outputMode' value='file'>file
      </label>
      <label>
        <input type='radio' v-model='options.outputMode' value='size'>base64
      </label>
    </div>
    <div>
      <label>左</label>
      <input type='number' v-model.number='options.left'>px
    </div>
    <div>
      <label>上</label>
      <input type='number' v-model.number='options.top'>px
    </div>
    <div>
      <label>幅</label>
      <input type='number' v-model.number='options.width'>px
    </div>
    <div>
      <label>高さ</label>
      <input type='number' v-model.number='options.height'>px
    </div>
    <div>
      <label>合成元</label>
      <input type='file' @change='onUnderChange' multiple>
    </div>
    <div>
      <label>画像</label>
      <input type='file' @change='onFileChange' multiple>
    </div>

    <div>
      <button type='button' @click='run'>実行</button>
    </div>

    <div>
      <progress v-bind:value='progress' v-bind:max='files.length'></progress>
      <span>{{progress}} / {{files.length}}</span>
    </div>

    <div v-if='results.length' class='result' contenteditable>
      <img v-for='result in results' :src='result.src'>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import path from 'path'
import moment from 'moment'
import ImageUtil from './ImageUtil'
const del = global.require('del')

export default{
  data(){
    return {
      options: {
        outputMode: 'file',
        left: 29,
        top: 105,
        width: 320,
        height: 568,
      },
      under: null,
      files: [],
      results: [],
      progress: 0,
    }
  },
  methods: {
    async run(){
      if(!this.files){
        return;
      }
      this.clear()
      var underImage =  await createImage(this.under)
      var results = []
      var filename = 'combine' + moment().format('YYYYMMDD_HHmmss')
      for(var i = 0; i < this.files.length; i++){
        var file = this.files[i]
        var fileImage =  await createImage(file)
        var base64 = await combineImage(underImage, fileImage, this.options)
        var src
        if(this.options.outputMode === 'file'){
          var name = filename + (i + 1) + '.png'
          src = await ImageUtil.writeFileBase64(base64, path.join('log', name))
        }else{
          src = base64
        }
        results.push({src})
        this.progress += 1
      }
      this.results = results
    },
    onUnderChange(e){
      this.clear()
      this.under = e.target.files[0] || e.dataTransfer.files[0]
    },
    onFileChange(e){
      this.clear()
      this.files = e.target.files || e.dataTransfer.files
    },
    clear(){
      this.progress = 0
      this.results = []
      del.sync('log/combine*')
    }
  }
}

function combineImage(under, image, options){
  var canvas = document.createElement('canvas')
  canvas.width = under.width
  canvas.height = under.height
  var context = canvas.getContext('2d')
  context.drawImage(under, 0, 0)
  context.drawImage(image, 0, 0, options.width, options.height, options.left, options.top, options.width, options.height)
  return canvas.toDataURL()
}

async function createImage(file){
  var base64 = await createBase64(file)
  var image = new Image()
  image.src = base64
  return new Promise((resolve) => {
    image.onload = (e) => {
      resolve(image)
    }
  })
}

function createBase64(file){
  var reader = new FileReader()
  reader.readAsDataURL(file)
  return new Promise((resolve) => {
    reader.onload = (e) => {
      resolve(e.target.result)
    }
  })
}
</script>

<style>
</style>