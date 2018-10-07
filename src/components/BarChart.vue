<template>
  <div id="barChart">
    <svg ref="root"></svg>
  </div>
</template>
<script type="text/javascript">
import * as d3 from 'd3'
export default {
  data() {
    return {
      svgWidth: null,
      svgHeight: null
    }
  },
  props: ['chartData','colorMap'],
  watch: {
    chartData(val) {
      if (val) {
        this.draw()
      }
    }
  },
  methods: {
    draw() {
      var svg = d3.select(this.$refs.root),
        margin = { top: 20, right: 30, bottom: 30, left: 50 },
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

      var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(this.chartData.map(function(d) { return d.type; }));
      y.domain([0, d3.max(this.chartData, function(d) { return d.num; })]);

      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))

      g.selectAll(".bar")
        .data(this.chartData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.type); })
        .attr("y", function(d) { return y(d.num); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.num); })
        .attr("fill",d=>this.colorMap[d.type]);
    }
  },
  mounted() {
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    d3.select(this.$refs.root).attr("width", this.svgWidth).attr("height", this.svgHeight)
  },
}

</script>
<style type="text/css" lang="scss">
#barChart {
  svg {
  	width:100%;
    height: 100%;
  }
}

</style>
