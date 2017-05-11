<template>
  <div style='height: 100%;'>
    <div>
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
        <input type='number' v-model.number='options.number.col'>個
      </div>
      <div>
        <label>横</label>
        <input type='number' v-model.number='options.number.row'>個
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

    <div v-for='result in results' class='result' contenteditable>
      <div v-for='row in result'>
        <image-tag :src='image.src' :key='index' v-for='(image, index) in row'/>
      </div>
    </div>
  </div>
</template>

<script>
import path from 'path'
import moment from 'moment'
import ImageUtil from './lib/ImageUtil'
import FileUtil from './lib/FileUtil'
import ImageTag from './components/ImageTag'

export default {
  components: {
    ImageTag
  },
  data(){
    return {
      options: {
        outputMode: 'file',
        mode: 'number',
        size: {
          width: 100,
          height: 200,
        },
        number: {
          row: 2,
          col: 3,
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

      const results = []
      for(const file of this.files){
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
      FileUtil.deleteSync('log/divide/*')
    }
  }
}

async function divide(file, options){
  const image = await FileUtil.toImage(file)
  const mode = options.mode
  let col
  let row
  let result
  if(mode === 'size'){
    const width = options.size.width
    const height = options.size.height
    col = Math.ceil(image.width / width)
    row = Math.ceil(image.height / height)
    result = ImageUtil.split(image, width, height)
  }else if(mode === 'number'){
    col = Math.max(options.number.col, 1)
    row = Math.max(options.number.row, 1)
    result = ImageUtil.divide(image, col, row)
  }
  const results = []
  for(let y = 0; y < row; y++){
    const array = []
    for(let x = 0; x < col; x++){
      const base64 = result[col * y + x]
      let src
      if(options.outputMode === 'file'){
        const filename = path.join('log', 'divide', file.name, (y + 1) + '-' + (x + 1) + '.png')
        src = await ImageUtil.writeFileBase64(base64, filename)
      }else{
        src = base64
      }
      array.push({src})
    }
    results.push(array)
  }
  return results
}
</script>

<style>
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
