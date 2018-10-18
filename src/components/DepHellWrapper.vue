<template>
  <div class="dep-hell bl-card-shadow" ref="root">
    <!-- <svg :width="svgWidth" :height="svgHeight" ref="svg"> -->
    <svg ref="svg">
      <g class="legend-wrapper" :style="{transform:`translateX(${(svgWidth-legendWrapperWidth)/2}px)`}">
        <g :style="{transform:`translate(${idx*(legend.width+legendLabelLen+20)}px,20px)`}" v-for="(val,key,idx) in colorMap">
          <rect :width="legend.width" :height="legend.height" :fill="val" rx="5" ry="5" @click="toggleType(idx)" :class="{'disabled-type':!typeStatus[idx]}"></rect>
          <text :textLength="legendLabelLen" :x="legend.width+3" :y="legend.height/2" lengthAdjust="spacingAndGlyphs" alignment-baseline="central">{{key}}</text>
        </g>
      </g>
    </svg>
  </div>
</template>
<script type="text/javascript">
import * as d3 from 'd3'
export default {
  data() {
    return {
      deps: null,
      svg: null,
      svgWidth: null,
      svgHeight: 0,
      legendLabelLen: 60,
      legend: {
        width: 50,
        height: 20,
      },
      legendInnerPadding: 3,
      legendOuterPadding: 20,
      lenTreshold: 22,
      typeStatus: [true, true, true], //indicates whether corresponding type(dep link and rect style) is visible or not
      depLinkGroupG: null,
      longestDepLen: 99999,
      hierarchyHiehgt: 100,
      stackHeight: 30,
      fileDepInfo: null // store dep info for each file
    }
  },
  props: ['root', 'badDeps', 'colorMap'],
  updated() {
    console.log("dephellwrapper updated")
    console.log('root in dephell:', this.root)
  },
  computed: {
    dendrogramR() { return Math.min(this.svgWidth, this.svgHeight) / 2 - 120 },
    legendWrapperWidth() {
      let num = Object.keys(this.colorMap).length
      return (this.legend.width + this.legendInnerPadding + this.legendLabelLen) * num + (this.legendOuterPadding) * (num - 1)
    }
  },
  methods: {
    filterLongDep(val) {
      console.log(val)
      d3.select(".dep-hell .dep-link-wrapper").remove()
      d3.select(".dep-hell .dendrogram").remove()
      d3.select(".dep-hell .radial-stack").remove()
      this.drawDepLinks()
      this.drawDendrogram()
    },
    throttledFilterLongDep() {
      let delay = 3000,
        timer
      console.log('change')
      /*      function filterLongDep() {
              console.log("cb")
            }

            function (val){
              if(timer){
                clearTimeout(timer)
                timer=null
              }
              console.log(val)
              setTimeout(filterLongDep.bind(this),delay)
            }*/

    },
    toggleType(idx) {
      this.typeStatus.splice(idx, 1, !this.typeStatus[idx])
    },
    drawHierachy() {
      let vm = this
      var formatNumber = d3.format(",d");

      var x = d3.scaleLinear()
        .range([0, 2 * Math.PI]);

      var y = d3.scaleLinear()
        .range([this.dendrogramR + this.stackHeight, this.dendrogramR + this.stackHeight + this.hierarchyHiehgt]).domain([1, 0]);

      var color = d3.scaleOrdinal(d3.schemeCategory20);

      var partition = d3.partition();

      var arc = d3.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


      var svg = this.centerSvg.append("g")

      //partition the tree and attach additional attr on root as well as its descendants
      var node = svg.selectAll(".hierarchy-node").data(partition(this.root).descendants().slice(1)).enter().append("g")
      node.append("path")
        .attr("class", "hierarchy-node")
        .attr("d", arc)
        .attr("id", d => d.data.name)
        .style("stroke", d => {
          /*          if(d.data.type==="dir")
                      return 'black'
                    else*/
          return 'white'
        })
        .style("fill", function(d) {
          if (d.data.type === "dir")
            return "#fed9a6"
          return '#e5d8bd' /*color((d.children ? d : d.parent).data.name);*/
        }).on("click", function(d) {
          // console.log(d.data)
          // console.log(vm.fileDepInfo)
          //attach 'id' identifier to each path that belongs to d.data.name
          let depInfo = vm.fileDepInfo.find(dep => dep.fileName === d.data.name)
          console.log(depInfo)
          // depInfo.forEach((val,idx)=>val.id=idx)
          // console.log(depInfo)
          vm.$bus.$emit('begin-dep-path', Object.assign({ depInfo, colorMap: vm.colorMap }))
          vm.$bus.$emit('begin-dep-table', Object.assign({ depInfo, colorMap: vm.colorMap }))
          vm.$bus.$emit('file-select', d.data.name)
        })
        /*.on("mouseenter",function(d){
                  d3.select(this).attr("transform",'scale(2 2)')
                  console.log(d)
                })*/
        .append("title")
        // .text(function(d) { return d.data.name.slice(d.data.name.lastIndexOf('/') + 1) })
        .text((d) => d.data.name)
        .each(function(d) {
          // console.log(this)
          // console.log(this.getBBox().width)
        })
      /*      node.filter(d => d.data.type === "dir").append("text").attr("transform", function(d) {
                let rotateDeg = (x(d.x0) * 180 / Math.PI - 90 + x(d.x1) * 180 / Math.PI - 90) / 2,
                  tranlsateX = y(d.y1)
                return `rotate(${rotateDeg})translate(${tranlsateX})rotate(90)`
              }).style("text-anchor", "middle")
              .text(function(d) {
                return arc(d)
              })*/
      node.filter(d => d.data.type === "dir").append("text")
        .attr("dy", 13)
        // .attr("dx",30)
        // .attr("dx",d=>document.getElementById(d.data.name.slice(d.data.name.lastIndexOf('\\') + 1)).getTotalLength()/2)
        .append("textPath")
        .attr("href", d => '#' + d.data.name)
        .each(function(d) {
          // console.log(document.getElementById(d.data.name).getTotalLength())
        })
        .text(d => d.data.name.slice(d.data.name.lastIndexOf('/') + 1))
        .each(function(d) {
          //filter visible text
          let maxDim = Math.max(this.getBBox().height, this.getBBox().width),
            visible = maxDim < document.getElementById(d.data.name).getTotalLength() / 4
          /*              console.log(this,this.getBBox().width,document.getElementById(d.data.name).getTotalLength(),d.data.name,this.getBBox().width<document.getElementById(d.data.name).getTotalLength()/4)*/
          if (!visible) {
            // console.log("none")
            d3.select(this).text("")
            // console.log(this.getBBox().width,document.getElementById(d.data.name).getTotalLength(),d.data.name)
          }
        })
      /*        console.log("width")
              d3.selectAll("text").each(function(d){
                console.log(this.getBBox().width)
              })
      */

    },
    drawDendrogram() {
      // console.log(this.lenTreshold,legendInnerPadding)
      /*      let vm = this
            let svg = this.svg.append("g")
              .attr("transform", "translate(" + this.svgWidth / 2 + "," + (this.svgHeight / 2) + ")")
              .attr("class", "dendrogram");
      */
      var cluster = d3.cluster()
        .size([360, this.dendrogramR]).separation(() => 1);
      cluster(this.root)

      /*      var link = svg.append("g").attr("class", "dendrogram-links").selectAll(".link")
              .data(this.root.descendants().slice(1))
              .enter().append("path")
              .attr("class", "link")
              .attr("d", function(d) {
                return "M" + project(d.x, d.y) +
                  "C" + project(d.x, (d.y + d.parent.y) / 2) +
                  " " + project(d.parent.x, (d.y + d.parent.y) / 2) +
                  " " + project(d.parent.x, d.parent.y);
              });*/

      /*      var node = svg.append("g").attr("class", "dendrogram-nodes").selectAll(".node")
              .data(this.root.descendants())
              .enter().append("g")
              .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
              .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });*/

      /*      node.append("circle")
              .attr("r", 2.5);

            node.append("title").text(d => d.data.name)
            node.append("text")
              .attr("dy", "0.31em")*/
      // .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
      // .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
      // .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
      // .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });

      function project(x, y) {
        var angle = (x - 90) / 180 * Math.PI,
          radius = y;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
      }
    },
    drawDepLinks() {
      // console.log(this.lenTreshold)
      // let { directCirclePaths, indirectCirclePaths } = data
      //radialStack depends on badDeps data
      this.drawRadialStack()
      let data = this.badDeps.slice()
      let longGroup = data.find(d => d.type === 'long'),
        svg = this.centerSvg.append("g")
        .attr("class", "dep-link-wrapper"),
        vm = this
      // this.lenTreshold=longGroup.threshold
      this.longestDepLen = longGroup.longestPathLen
      let depLink = svg.append("g").attr("class", "dep-links-group").selectAll(".dep-links-group")
      var line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; });

      this.depLinkGroupG = depLink.data(data).enter().append("g")
        .attr("class", d => `dep-links-group__${d.type}`)
      this.depLinkGroupG.selectAll(".dep-link")
        .data(d => extractShortesPath(d.paths))
        .enter().append("path")
        .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
        .attr("class", "dep-link")
        .attr("d", line)
      //extract shortest paht between each node in paths to achieve edge bundling
      function extractShortesPath(paths) {
        // console.log(paths)
        let nodes = vm.root.leaves()
        var map = {},
          shortestPathArr = [];
        // Compute a map from name to node.
        nodes.forEach(function(d) {
          map[d.data.name] = d;
        });

        // console.log(map)
        // For each path, construct a link from the source to target node.
        paths.forEach(function({ path }) {
          path.reduce(function(a, b) {
            // console.log(a,b)
            shortestPathArr.push(map[a].path(map[b]))
            return b
          })
        })
        return shortestPathArr
      }
    },
    drawRadialStack() {
      //get StackData from badDeps
      let keys = ['long', 'indirect', 'direct'].map(d => `${d}-count`),
        stack = d3.stack().keys(keys)
      this.fileDepInfo = []
      this.root.leaves().forEach(node => {
        let fileName = node.data.name,
          stackItem = { fileName }
        for (let dep of this.badDeps) {
          let type = dep.type,
            paths = dep.paths,
            filteredDeps = paths.filter(d => d.path.indexOf(fileName) !== -1)
          stackItem[`${type}-paths`] = filteredDeps
          stackItem[`${type}-count`] = filteredDeps.length
        }
        this.fileDepInfo.push(stackItem)
      })
      let series = stack(this.fileDepInfo)
      console.log(series)
      //draw stack chart
      let maxVal = d3.max(series[series.length - 1], d => d[1])
      // console.log(maxVal)
      var y = d3.scaleLinear()
        .range([this.dendrogramR + 5, this.dendrogramR + this.stackHeight]).domain([maxVal, 0]);
      let offset = 2 * Math.PI / this.root.leaves().length
      var arc = d3.arc()
        .startAngle(function(d, i) { return i * offset })
        .endAngle(function(d, i) { return (i + 1) * offset })
        .innerRadius(function(d) { return y(d[0]) })
        .outerRadius(function(d) { return y(d[1]) });

      let seiresG = this.centerSvg.append("g")
        .attr("class", "radial-stack")
        .selectAll("g").data(series).enter().append('g').attr("class", 'seires')
        .attr("fill", (d, i) => {
          let type = keys[i].split('-')[0]
          return this.colorMap[type]
        })
      seiresG.selectAll('g').data(d => d).enter().append('path').attr('d', arc)

    },
    initSvg() {
      this.svg = d3.select(".dep-hell svg")
      this.centerSvg = d3.select(".dep-hell svg .center-g")
      /*            this.svg = d3.select(".dep-hell").append("svg")
                    .attr("width", this.svgWidth)
                    .attr("height", this.svgHeight)*/
    }
  },
  watch: {
    //show whether particular dep-link-group is visible according to status
    typeStatus(status) {
      // console.log(status)
      this.depLinkGroupG.attr('stroke-opacity', (d, idx) => {
        if (status[idx])
          return 0.3
        else
          return 0
      })
    },
    root(val) {
      console.log('root in dephellwrapper watch:', this.root)
      if (val) {
        this.initSvg()
        this.drawDendrogram()
        this.drawHierachy()
        this.drawDepLinks()
      }
    }
  },
  mounted() {
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    console.log(this.svgHeight,Math.floor(this.$refs.root.offsetHeight))
    // Todo:目前需要手动减10
    d3.select(".dep-hell svg").attr("width", this.svgWidth).attr("height", this.svgHeight-10)
      .append("g").attr("class", "center-g")
      .attr("transform", "translate(" + this.svgWidth / 2 + "," + (this.svgHeight / 1.9) + ")")
  }
}

</script>
<style type="text/css" lang="scss">
.dep-hell {
  .legend-wrapper {
    rect.disabled-type {
      fill: grey;
    }
  }
  .hierarchy-node {
    // stroke: #fff;
    &:hover {
      transform: translate(20);
    }
  }
  .dendrogram-links {
    path {
      stroke: steelblue;
      stroke-opacity: 0;
      fill: none;
      pointer-events: none;
    }
  }
  .dendrogram-nodes {
    opacity: 0;
  }
  /*   .dep-link {
    stroke: red;
    stroke-opacity: 0.4;
    fill: none;
    pointer-events: none;
  } */
  .dep-links-group {
    stroke-width: 4px;
    fill: none; // stroke-opacity: 0.1;
    .dep-links-group__indirect {
      path {
        stroke: #4daf4a;
      }
    }
    .dep-links-group__direct {
      path {
        stroke: #377eb8;
      }
    }
    .dep-links-group__long {
      path {
        stroke: #e41a1c;
      }
    }
  }
}

</style>
