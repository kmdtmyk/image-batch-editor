<template>
  <img :src='src'>
</template>

<script>
export default{
  props: [
    'src'
  ]
}
</script>

<style scoped>
img{
  margin: 5px;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.4);
  line-height: 0;
}
</style>
