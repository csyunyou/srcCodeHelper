<template>
  <div class="code-chart" v-highlight v-html="content">
  </div>
</template>
<script type="text/javascript">
export default {
  data() {
    return {
      content: ''
    }
  },
  mounted() {
    this.$bus.$on('draw-codechart', (selectedFile) => {
      console.log(selectedFile)
      this.$axios.get('files/getFileContent', {
        filename: selectedFile
      }).then(({ data }) => {
        this.content =`<pre><code>${data.content}</code></pre>`
      })
    })
  }
}

</script>
<style type="text/css" lang="scss">
.code-chart {
  height: 100%;
  overflow-x: scroll;
  overflow-y: scroll;
}

</style>
