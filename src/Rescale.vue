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
      <div>
        <label>
          <input type='radio' v-model='options.mode' value='scale'>倍率で指定
        </label>
      </div>
      <div>
        <label>幅</label>
        <input type='number' v-model.number='options.scale.width'>%
      </div>
      <div>
        <label>高さ</label>
        <input type='number' v-model.number='options.scale.height'>%
      </div>
    </div>

    <div>
      <div>
        <label>
          <input type='radio' v-model='options.mode' value='size'>大きさで指定
        </label>
      </div>
      <div>
        <label>幅</label>
        <input type='number' v-model.number='options.size.width'>px
      </div>
      <div>
        <label>高さ</label>
        <input type='number' v-model.number='options.size.height'>px
      </div>
    </div>

    <div>
      <label>画像</label>
      <input type='file' @change='onFileChange' accept='image/*' multiple>
    </div>

    <div>
      <button type='button' v-on:click='run'>実行</button>
    </div>

    <div>
      <progress v-bind:value='progress' v-bind:max='files.length'></progress>
      <span>{{progress}} / {{files.length}}</span>
    </div>

    <div v-if='results.length' class='result' contenteditable>
      <img v-for='image in results' :src='image.src + "?" + runtime'>
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
        mode: 'scale',
        scale: {
          width: 50,
          height: 50,
        },
        size: {
          width: 100,
          height: 200,
        },
      },
      results: [],
      files: [],
      progress: 0,
      runtime: null,
    }
  },
  methods: {
    async run(){
      if(!this.files){
        return;
      }
      this.clear()
      this.runtime = Date.now()

      var results = []
      for(var file of this.files){
        var image =  await ImageUtil.fileToImage(file)
        var width
        var height
        if(this.options.mode === 'scale'){
          width = image.width * this.options.scale.width / 100
          height = image.height * this.options.scale.height / 100
        }else{
          width = this.options.size.width
          height = this.options.size.height
        }
        var base64 = await rescaleImage(image, {width, height})
        var src
        if(this.options.outputMode === 'file'){
          var filepath = path.join('log', 'rescale', file.name)
          src = await ImageUtil.writeFileBase64(base64, filepath)
        }else{
          src = base64
        }
        results.push({src})
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

function rescaleImage(image, options){
  var width = options.width || image.width
  var height = options.height || image.height
  var canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  var context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
  return canvas.toDataURL()
}
</script>

<style>
</style>
