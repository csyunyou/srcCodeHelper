<template>
  <div class="detail-path">
  </div>
</template>
<script type="text/javascript">
export default {
  data() {
    return {
      graphData: {},
      depData: null
    }
  },
  mounted() {
    this.$bus.$on('highlight-dep', (dep) => {
      this.depData = dep
      this.dataAdapter()
    })
  },
  methods: {
    dataAdapter() {
      // console.log(this.depData)
      let nodes = new Set(),
        links = new Set(),
        { path, type } = this.depData
      for (let i = 0; i < path.length - 1; i++) {
        nodes.add(path[i]) //add node
        links.add(path[i] + '|' + path[i + 1]) //add link('|' is used as conjunction to connect the two nodes)
      }
      //we need to connect the last node and the first node in type 'indirect' || 'direct'
      if (type === 'indirect' || type === 'direct')
        links.add(path[path.length - 1] + '|' + path[0])
      nodes.add(path[path.length - 1]) // do not miss the last node
      // console.log(nodes, links)
      this.graphData.nodes = [...nodes].map(d => ({ id: d }))
      this.graphData.links = [...links].map(function(d) {
        let parts = d.split('|')
        return { source: parts[0], target: parts[1] }
      })
      console.log(this.graphData)
    }
  }
}

</script>
<style type="text/css" lang="scss">


</style>
