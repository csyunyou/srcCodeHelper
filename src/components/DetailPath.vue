<template>
  <div class="detail-path bl-card" ref="root">
  </div>
</template>
<script type="text/javascript">
import * as d3 from 'd3'
export default {
  data() {
    return {
      graphData: {},
      depData: null,
      svgWidth: null,
      svgHeight: null
    }
  },
  mounted() {
    this.$bus.$on('highlight-dep', (dep) => {
      this.depData = dep
      this.dataAdapter()
      this.draw()
    })
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    this.svg = d3.select(this.$refs.root).append("svg").attr("width", this.svgWidth).attr("height", this.svgHeight)
  },
  methods: {
    draw() {
      d3.select(this.$refs.root).selectAll('svg *').remove()
      let vm = this
      // 添加箭头形状
      this.svg.append("defs").append("marker")
        .attr("id", "detail-path-arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

      var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().distanceMin(60).strength(-120))
        // .force("charge", d3.forceCollide())
        // .force("charge", d3.forceRadial())
        .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2));

      // 画线
      this.links = this.svg.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(this.graphData.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("marker-end", function(d) { return "url(#detail-path-arrow)"; });

      // 画点
      this.nodes = this.svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(this.graphData.nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", d => {
          return 'white'
        })
        .attr("stroke", "black")
        .on('click', (d) => {
          /*          this.$bus.$emit('draw-wordcloud', d.id)
                    this.$bus.$emit('draw-partition', d.id)*/
        })
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      // 标题
      this.nodes.append("title")
        .text(function(d) { return d.id; })
      // 说明文字
      this.text = this.svg.append("g").selectAll("text")
        .data(this.graphData.nodes)
        .enter().append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) { return vm.formatText(d.id); });

      simulation
        .nodes(this.graphData.nodes)
        .on("tick", ticked);

      simulation.force("link")
        .links(this.graphData.links);

      function ticked() {
        vm.links.attr("d", linkArc);
        vm.nodes.attr("transform", transform);
        vm.text.attr("transform", transform);
      }

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      function linkArc(d) {
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      }

      function transform(d) {
        return "translate(" + d.x + "," + d.y + ")";
      }
    },
    formatText(text){
    	let idx=text.lastIndexOf("/")
    	return text.slice(idx+1).match(/(.*)(\.js)$/)[1]
    },
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
    }
  }
}

</script>
<style type="text/css" lang="scss">
.detail-path {
  .link {
    fill: none;
    stroke: #666;
    stroke-width: 1.5px;
  }
}

</style>
