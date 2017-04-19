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
      <input type='file' @change='onUnderChange' accept='image/*' multiple>
    </div>
    <div>
      <label>画像</label>
      <input type='file' @change='onFileChange' accept='image/*' multiple>
    </div>

    <div>
      <button type='button' @click='run'>実行</button>
    </div>

    <div>
      <progress v-bind:value='progress' v-bind:max='files.length'></progress>
      <span>{{progress}} / {{files.length}}</span>
    </div>

    <div v-if='results.length' class='result' contenteditable>
      <my-image v-for='(image, index) in results' :key='index' :src='image.src'/>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import path from 'path'
import moment from 'moment'
import ImageUtil from './ImageUtil'
import MyImage from './components/Image'
const del = global.require('del')

export default{
  components: {
    MyImage
  },
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
      var underImage =  await ImageUtil.fileToImage(this.under)
      var results = []
      var now = Date.now()
      for(var i = 0; i < this.files.length; i++){
        var file = this.files[i]
        var fileImage =  await ImageUtil.fileToImage(file)
        var base64 = await combineImage(underImage, fileImage, this.options)
        var src
        if(this.options.outputMode === 'file'){
          var filepath = path.join('log', 'combine', file.name)
          src = await ImageUtil.writeFileBase64(base64, filepath) + '?' + now
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
      del.sync('log/combine/*')
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
</script>

<style>
</style>
