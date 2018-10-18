<template>
  <div id='line-chart-wrapper' class="bl-card-shadow">
    <div class="line-chart" ref="root">
      <svg></svg>
    </div>
    <div class="control-panel">
      <div class="control-len-threshold">
        <span class="label">Length Treshold</span>
        <el-slider v-model="lenThreshold" :min="0" :max='maxLen' @change="filterLongDep">
        </el-slider>
      </div>
    </div>
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
  props: ["lenDis",'lenThreshold','maxLen'],
  mounted() {
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    // d3.select(this.$refs.root).attr("width", this.svgWidth).attr("height", this.svgHeight)
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
      this.chartData=[]
      let maxLen = d3.max(Object.keys(this.lenDis), d => parseInt(d))
      for (let i = 0; i < maxLen; i++) {
        if (this.lenDis[i]) this.chartData.push([i, this.lenDis[i]])
        else this.chartData.push([i, 0])
      }
    },
    filterLongDep(val){
      this.$emit('filterLongDep',val)
    },
    draw() {
      d3.select('.line-chart>svg *').remove()
      var svg = d3.select(".line-chart svg"),
        margin = { top: 20, right: 30, bottom: 30, left: 50 },
        width = this.svgWidth - margin.left - margin.right,
        height = this.svgHeight - margin.top - margin.bottom,
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
        .call(d3.axisLeft(y).ticks(null, 's'))

      g.append("path").datum(this.chartData).attr("d", line)
        .attr("class", "line")
    }
  }
}

</script>
<style type="text/css" lang="scss">
@import "../assets/reset.scss";
#line-chart-wrapper {
  .line-chart {
    flex: auto;
    svg {
      width: 100%;
      height: 100%;
      .axis--x path {
        display: none;
      }
      .line {
        fill: none;
        stroke: steelblue;
        stroke-width: 1.5px;
      }
    }
  }
  .control-panel {
    flex: none;
    padding: 0 40px;
    border-top:1px solid #ebeef5;
    .control-len-threshold {
      .label {
        line-height: 40px;
        font-weight: bold;
      }
      .el-slider {
        width: 62%;
        float: right;
      }
    }
  }
}

</style>
