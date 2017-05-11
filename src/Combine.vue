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
      <image-tag v-for='(image, index) in results' :key='index' :src='image.src'/>
    </div>
  </div>
</template>

<script>
import path from 'path'
import moment from 'moment'
import ImageUtil from './lib/ImageUtil'
import FileUtil from './lib/FileUtil'
import ImageTag from './components/ImageTag'

export default{
  components: {
    ImageTag
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
      const underImage =  await FileUtil.toImage(this.under)
      const results = []
      const options = this.options
      for(let i = 0; i < this.files.length; i++){
        const file = this.files[i]
        const fileImage =  await FileUtil.toImage(file)
        const base64 = ImageUtil.combine(underImage, fileImage, options.left, options.top, options.width, options.height)
        let src
        if(options.outputMode === 'file'){
          const filepath = path.join('log', 'combine', file.name)
          src = await ImageUtil.writeFileBase64(base64, filepath)
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
      FileUtil.deleteSync('log/combine/*')
    }
  }
}
</script>

<style>
</style>
