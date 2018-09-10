<template>
  <div ref="root" id="parallel-coordinate">
  </div>
</template>
<script type="text/javascript">
import * as d3 from 'd3';

export default {
  data() {
    return {
      svgHeight: null,
      svgWidth: null,
      chartData: null
    }
  },
  props: ['root'],
  watch: {
    root(val) {
      if (val !== null) {
        // console.log(this.root, this.root.leaves())
        this.dataAdapter()
        console.log(this.chartData)
        this.draw()
      }
    }
  },
  methods: {
    draw() {
      function path(d) {
        console.log(dimensions.map(function(dim) { return [x(dim), y[dim](d[dim])]; }))
        return line(dimensions.map(function(dim) { return [x(dim), y[dim](d[dim])]; }));
      }
      var margin = { top: 50, right: 10, bottom: 40, left: 40 },
        width = this.svgWidth - margin.left - margin.right,
        height = this.svgHeight - margin.top - margin.bottom;

      console.log('svgWidth',this.svgWidth)
      var x = d3.scaleBand().rangeRound([0, this.svgWidth]).padding(0.2),
        y = {},
        dragging = {};


      var line = d3.line(),
        //axis = d3.axisLeft(x),
        background,
        foreground,
        extents,
        dimensions = ['func', 'depending', 'depended', 'direct', 'indirect', 'long', 'size'];

      var svg = d3.select(this.$refs.root).append("svg")
        .attr("width", this.svgWidth)
        .attr("height", this.svgHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(dimensions);

      // 画线
      dimensions.forEach((d) => {
        y[d] = d3.scaleLinear()
          .domain(d3.extent(this.chartData, function(p) {
            return +p[d];
          }))
          .range([height, 0])
      })

      background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(this.chartData)
        .enter().append("path")
        .attr("d", path);

      // 画坐标轴
      var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })

      g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(d3.axisLeft(y[d])); })
        //text does not show up because previous line breaks somehow
        .append("text")
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; });

    },
    dataAdapter() {
      const dimensions = d3.keys(this.root.leaves()[0].data.fileInfo).filter(d => d !== 'scc');
      this.chartData = this.root.leaves().map(d => {
        let fileInfo = {}
        dimensions.forEach((dim) => {
          const val = d.data.fileInfo[dim]
          fileInfo[dim] = val.hasOwnProperty('length') ? val.length : val
        })
        return Object.assign({}, {
          name: d.data.name,
          ...fileInfo
        })
      })
    }
  },
  mounted() {
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    console.log(this.svgWidth, this.svgHeight)
  }
}

</script>
<style type="text/css" lang="scss">
#parallel-coordinate {
  height: 100%;
  .background path {
    fill: none;
    stroke: #ddd;
    stroke-opacity: 1;
    shape-rendering: crispEdges;
  }
}

</style>
