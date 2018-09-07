<template>
  <div ref="root">
  	<!-- <div>num:</div> -->
  </div>
</template>
<script type="text/javascript">
import * as d3 from 'd3'
export default {
  data() {
    return {
      graphData: {},
      svgWidth: null,
      svgHeight: null,
      svg: null,
      nodes:null,
      links:null,
      defaultR:5
    }
  },
  methods: {
    dataAdapter() {
      // console.log(this.depData)
      let nodes = new Set(),
        links = new Set()
      this.depData.forEach(({path}) => {
        for (let i = 0; i < path.length - 1; i++) {
          nodes.add(path[i]) //add node
          links.add(path[i] + '|' + path[i + 1]) //add link('|' is used as conjunction to connect the two nodes)
        }
        //we need to connect the last node and the first node in type 'indirect'
        if(this.type==='indirect')
        	links.add(path[path.length-1]+'|'+path[0])
        nodes.add(path[path.length - 1]) // do not miss the last node
      })
      // console.log(nodes, links)
      this.graphData.nodes = [...nodes].map(d => ({ id: d }))
      this.graphData.links = [...links].map(function(d) {
        let parts = d.split('|')
        return { source: parts[0], target: parts[1] }
      })
      // console.log(this.graphData)
    },
    resetAllStyle(){
    	this.nodes.attr("stroke-dasharray",null).attr("r",this.defaultR)
    	this.links.attr("stroke-dasharray",null)
    },
    draw() {
    let vm=this
      var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().distanceMax(100))
        // .force("charge", d3.forceCollide())
        // .force("charge", d3.forceRadial())
        .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2));

      this.links = this.svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(this.graphData.links)
        .enter().append("line")
        .attr("stroke", d=>this.color)
        .attr("stroke-width", function(d) { return 2 });

      this.nodes = this.svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(this.graphData.nodes)
        .enter().append("circle")
        .attr("r", this.defaultR)
        .attr("fill",d=>{
        	if(d.id===this.fileName)
        		return '#636363'
        	return 'white'
        })
        .attr("stroke","black")
        .on('click',(d)=>{
          this.$bus.$emit('draw-wordcloud',d.id)
        })
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      this.nodes.append("title")
        .text(function(d) { return d.id; })

      simulation
        .nodes(this.graphData.nodes)
        .on("tick", ticked);

      simulation.force("link")
        .links(this.graphData.links);

      function ticked() {
        vm.links
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        vm.nodes
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
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

    }
  },
  props: ['color', 'type', 'depData','fileName'],
  watch: {
    depData() {
      // console.log('depData update')
      this.dataAdapter()
      this.draw()
    }
  },
  created() {
    // console.log('created')
  },
  updated() {
    // console.log('updated')
  },
  mounted() {
    // console.log('mount')
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    // this.svgWidth =373
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    this.svg = d3.select(this.$refs.root).append("svg").attr("width", this.svgWidth).attr("height", this.svgHeight)
    this.dataAdapter()
    this.draw()
    this.$bus.$on('highlight-dep',dep=>{
    	if(dep.type!==this.type) return
    	this.resetAllStyle()
    	let path=dep.path,nodes=[],links=[]
    	//nodes and links are extracted from path to highlight the coresponding links and nodes svg
    	for(let i=0,len=path.length;i<len-1;i++){
    		nodes.push(path[i])
    		links.push({source:path[i],dep:path[i+1]})
    	}
    	//we need to connect the last node and the first node in type 'indirect'
    	if(this.type==='indirect')
    		links.push({source:path[path.length-1],dep:path[0]})
    	nodes.push(path[path.length-1])

    	// console.log(nodes,links,this.nodes)

    	//highlight nodes
    	this.nodes.filter(function(node){
    		return nodes.find(d=>d===node.id)!==undefined
    	}).attr('stroke-dasharray','2')

    	//highlight the first and last nodes
    	this.nodes.filter(node=>nodes.findIndex(d=>d===node.id)===0).attr("r",10)
    	this.nodes.filter(node=>nodes.findIndex(d=>d===node.id)===nodes.length-1).attr("r",4)

    	//highlight links
    	this.links.filter(link=>links.find(d=>link.source.id===d.source&&link.target.id===d.dep)!==undefined)
    		.attr("stroke-dasharray",'3')
    })
    // this.dataAdapter()
    // console.log(this.color,this.type,this.depData)
  }
}

</script>
<style type="text/css" lang="scss" scoped>


</style>
