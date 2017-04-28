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
    }
  },
  methods: {
    async run(){
      if(!this.files){
        return;
      }
      this.clear()
      const now = Date.now()
      const results = []
      for(const file of this.files){
        const image =  await FileUtil.toImage(file)
        let width
        let height
        if(this.options.mode === 'scale'){
          width = image.width * this.options.scale.width / 100
          height = image.height * this.options.scale.height / 100
        }else{
          width = this.options.size.width
          height = this.options.size.height
        }
        const base64 = ImageUtil.resize(image, width, height)
        let src
        if(this.options.outputMode === 'file'){
          const filepath = path.join('log', 'resize', file.name)
          src = await ImageUtil.writeFileBase64(base64, filepath) + '?' + now
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
      FileUtil.deleteSync('log/resize/*')
    }
  }
}
</script>

<style>
</style>
