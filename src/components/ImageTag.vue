<template>
  <img :src='url' @contextmenu='contextmenu'>
</template>

<script>
const { remote, shell, nativeImage, clipboard } = electron
const { Menu, MenuItem } = remote

export default{
  props: [
    'src'
  ],
  beforeCreate(){
    this.now = Date.now()
  },
  computed: {
    isBase64(){
      return this.src.match(/^data:/) !== null
    },
    url(){
      const { src } = this
      if(this.isBase64){
        return src
      }else{
        return src + '?' + this.now
      }
    }
  },
  methods: {
    contextmenu(e){
      const src = this.src
      const menu = new Menu()
      menu.append(new MenuItem({
        label: 'open',
        enabled: !this.isBase64,
        click(){
          shell.openExternal(src)
        }
      }))
      menu.append(new MenuItem({
        label: 'copy',
        click(){
          const image = nativeImage.createFromPath(src)
          clipboard.writeImage(image)
        }
      }))
      menu.popup(remote.getCurrentWindow())
    }
  }
}
</script>

<style scoped>
img{
  margin: 5px;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.4);
  line-height: 0;
}
</style>
