<template>
  <div ref="root" id="parallel-coordinate">what
  </div>
</template>
<script type="text/javascript">
export default {
  data() {
    return {
      svgHeight: null,
      svgWidth: null,
    }
  },
  props: ['root'],
  methods: {
    draw() {
      var margin = { top: 30, right: 10, bottom: 10, left: 10 },
        width = 600 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

      var x = d3.scaleBand().rangeRound([0, width]).padding(1),
        y = {},
        dragging = {};


      var line = d3.line(),
        //axis = d3.axisLeft(x),
        background,
        foreground,
        extents;
    }
  },
  mounted() {
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    console.log(this.svgWidth, this.svgHeight)
  }
}

</script>
<style type="text/css" lang="scss" scoped>
#parallel-coordinate {
  height: 100%;
}

</style>
