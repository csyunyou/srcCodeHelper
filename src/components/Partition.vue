<template>
  <div class="partition-layout" ref='root'>
  </div>
</template>
<script type="text/javascript">
import * as d3 from 'd3'
export default {
  data() {
    return {
      svgWidth: null,
      svgHeight: null,
      svg: null
    }
  },
  props: ['root'],
  mounted() {
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    this.svg = d3.select(this.$refs.root).append('svg')
      .attr('width', this.svgWidth)
      .attr("height", this.svgHeight)
    console.log(this.svgWidth, this.svgHeight)
  },
  watch: {
    root(val) {
      if (val) {
        this.draw()
      }
    }
  },
  methods: {
    draw() {
      let x = d3.scaleLinear().range([0, this.svgWidth]),
        y = d3.scaleLinear().range([0, this.svgHeight])
              // console.log(this.root,this.root.descendants())
      let g = this.svg.selectAll('rect').data(this.root.descendants())
        .enter().append('g')
        .attr('transform', (d) => `translate(${x(d.x0)},${y(d.y0)})`)

      g.append('rect')
        .attr('width', (d) => x(d.x1 - d.x0))
        .attr('height', (d) => y(d.y1 - d.y0))
        .attr('fill', 'steelblue')
        .attr('stroke','#fff')
      g.append('text').attr('transform',(d)=>`translate(0,${y(d.y1-d.y0)/2})`).text(d=>d.data.name)
      // 
    }
  }
}

</script>
<style type="text/css" lang="scss" scoped>


</style>
