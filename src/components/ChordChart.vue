<template>
  <div class="chord-chart">
  </div>
</template>
<script type="text/javascript">
import * as d3 from 'd3'
export default {
  data() {
    return {
      data: null,
      arcColors: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5'],
      depMatrix: null,
      moduleNames: null,
      moduleDepsData:null
    }
  },
  computed: {},
  methods: {
    draw() {
      // console.log(matrix)
      /*      var matrix = [
              [11975, 5871, 8916, 2868],
              [1951, 10048, 2060, 6171],
              [8010, 16145, 8090, 8045],
              [0,0,0,0]
            ];*/
      let width = 960,
        height = 960
      let svg = d3.select(".chord-chart").append("svg").attr("width", width).attr("height", height),
        outerRadius = Math.min(width, height) * 0.5 - 40,
        innerRadius = outerRadius - 30;

      var formatValue = d3.formatPrefix(",.0", 1e3);

      var chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

      var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

      var ribbon = d3.ribbon()
        .radius(innerRadius);

      var color = d3.scaleOrdinal().domain(d3.range(this.depMatrix.length)).range(this.arcColors);

      var g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .datum(chord(this.depMatrix));

      var group = g.append("g")
        .attr("class", "groups")
        .selectAll("g")
        .data(function(chords) { return chords.groups; })
        .enter().append("g");

      group.append("path")
        .style("fill", function(d) { return color(d.index); })
        .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
        .attr("d", arc).append("title").text((d,i)=>this.moduleNames[i]);

      g.append("g")
        .attr("class", "ribbons")
        .selectAll("path")
        .data(function(chords) { return chords; })
        .enter().append("path")
        .attr("d", ribbon)
        .style("fill", function(d) { console.log(d);return color(d.target.index); })
        .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); })
        .on("click",ribbon=>{
          let a=this.moduleNames[ribbon.source.index],b=this.moduleNames[ribbon.target.index],
              aRefb=this.moduleDepsData.find(d=>(d.srcModule===a&&d.refModule===b)),
              bRefa=this.moduleDepsData.find(d=>(d.srcModule===b&&d.refModule===a))
              console.log(aRefb&&aRefb.deps)
              console.log(bRefa&&bRefa.deps)
        })
    },
    dataAdapter(data) {
      // console.log(data)
      let srcs = [...new Set(data.map(d => d.srcModule))],
        refs = [...new Set(data.map(d => d.refModule))],
        modules = [...new Set([...srcs, ...refs])]
      let matrix = [],
        rowNo = 0,
        colNo = 0,
        cell
      for (let src of modules) {
        matrix[rowNo] = Array(modules.length).fill(0)
        colNo = 0
        for (let ref of modules) {
          if ((cell = data.find(d => d.srcModule === src && d.refModule === ref)) !== undefined) {
            // console.log(cell)
            matrix[rowNo][colNo] = cell.deps.length
          }
          colNo++
        }
        rowNo++
      }
      console.log(matrix)
      return {
        moduleNames: modules,
        depMatrix: matrix
      }
    }
  },
  mounted() {
    this.$axios.get('files/getFileDeps').then(({ data }) => {
      let chordData = this.dataAdapter(data)
      this.moduleDepsData=data
      this.moduleNames=chordData.moduleNames,this.depMatrix=chordData.depMatrix
      this.draw()
    })
  }
}

</script>
<style type="text/css" scoped lang="scss">


</style>
