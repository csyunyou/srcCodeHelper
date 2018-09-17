<template>
  <div class="">
  </div>
</template>
<script type="text/javascript">
export default {
  data() {
    return {

    }
  },
  props: ['root'],
  mounted() {
    this.$bus.$on('draw-treemap', (selectedFile) => {
      this.getTreeMapData(selectedFile)
      this.draw()
    })
  },
  methods: {
    getTreeMapData(selectedFile) {
      function dfs(root) {
        if (root.data.type === 'file') {
          if (root.data.name === selectedFile)
            return root
          else return null
        }
        for (let i = 0, len = root.children.length; i < len; i++) {
          let res = dfs(root.children[i])
          if (res !== null) return res
        }
        return null
      }
      this.fileInfo = dfs(this.root)
    },
    draw() {
      console.log(this.fileInfo)
    }
  }
}

</script>
<style type="text/css" lang="scss" scoped>


</style>
