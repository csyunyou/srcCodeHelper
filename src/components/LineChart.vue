<template>
  <div id="lineChart">
    <svg ref="root"></svg>
  </div>
</template>
<script type="text/javascript">
import * as d3 from 'd3'
export default {
  data() {
    return {
      svgWidth: null,
      svgHeight: null,
      chartData: []
    }
  },
  props: ["lenDis"],
  mounted() {
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    d3.select(this.$refs.root).attr("width", this.svgWidth).attr("height", this.svgHeight)
    console.log(this.svgWidth, this.svgHeight, this.lenDis)
  },
  watch: {
    lenDis(val) {
      if (val) {
        this.dataAdapter()
        this.draw()
      }
    }
  },
  methods: {
    // 用0去插值缺失值
    dataAdapter() {
      let maxLen = d3.max(Object.keys(this.lenDis), d => parseInt(d))
      for (let i = 0; i < maxLen; i++) {
        if (this.lenDis[i]) this.chartData.push([i, this.lenDis[i]])
        else this.chartData.push([i, 0])
      }
    },
    draw() {
      var svg = d3.select(this.$refs.root),
        margin = { top: 20, right: 30, bottom: 30, left: 50 },
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var y = d3.scaleLinear().range([height, 0]),
        x = d3.scaleLinear().range([0, width])

      var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); });

      x.domain([0, d3.max(this.chartData, d => d[0])])
      y.domain([0, d3.max(this.chartData, d => d[1])])

      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(null,'s'))

      g.append("path").datum(this.chartData).attr("d", line)
      	.attr("class","line")
    }
  }
}

</script>
<style type="text/css" lang="scss">
#lineChart {
  svg {
    width: 100%;
    height: 100%;
    .axis--x path{
      display: none;
    }
    .line {
      fill: none;
      stroke: steelblue;
      stroke-width: 1.5px;
    }
  }
}

</style>
