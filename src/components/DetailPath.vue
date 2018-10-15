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
      svgHeight: null,
      forceStrength: {
        long: -30,
        indirect: -120,
        direct: -120
      },
      type: null
    }
  },
  mounted() {
    this.$bus.$on('highlight-dep', (dep) => {
      this.type = dep.type
      this.$axios.get('files/getDetailBadDepInfoByDepId', {
        lenThreshold: this.lenThreshold,
        type: dep.type,
        depId: dep.id
      }).then(({ data }) => {
        this.depData = data
        this.dataAdapter()
        this.draw()
      })
    })
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    this.svg = d3.select(this.$refs.root).append("svg").attr("width", this.svgWidth).attr("height", this.svgHeight)
  },
  props: ['lenThreshold'],
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
        .force("charge", d3.forceManyBody().distanceMin(60).strength(this.forceStrength[this.type]))
        // .force("charge", d3.forceCollide())
        // .force("charge", d3.forceRadial())
        .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2));

      // 画线
      const links = this.svg.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(this.graphData.links)
        .enter().append("g")
      // 线路径
      this.linksPath = links.append("path")
        .attr("class", "link")
        .attr("id", d => `${d.source}|${d.target}`)
        .attr("marker-end", function(d) { return "url(#detail-path-arrow)"; });
      // 线文字信息
      this.linksText = links.append("text")
        .append("textPath")
        .attr('href',d => `#${d.source}|${d.target}`)
        .attr('startOffset',10)
        .text(d=>"text")

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
      // 结点文字信息
      this.text = this.svg.append("g").selectAll("text")
        .data(this.graphData.nodes)
        .enter().append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) { return vm.formatText(d.id); });
      // 边文字信息
      this.svg.append("g").selectAll(".link-text")
        .data()
      simulation
        .nodes(this.graphData.nodes)
        .on("tick", ticked);

      simulation.force("link")
        .links(this.graphData.links);

      function ticked() {
        vm.linksPath.attr("d", linkArc);
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
    formatText(text) {
      let idx = text.lastIndexOf("/")
      return text.slice(idx + 1).match(/(.*)(\.js)$/)[1]
    },
    dataAdapter() {
      this.graphData.nodes = this.depData.nodes.map((d) => ({ id: d }))
      this.graphData.links = this.depData.links.slice()
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
