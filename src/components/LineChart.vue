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
    	width:null,
    	height:null,
    	chartData:[]
    }
  },
  props:["lenDis"],
  mounted() {
    this.width = Math.floor(this.$refs.root.clientWidth)
    this.height = Math.floor(this.$refs.root.clientHeight)
    console.log(this.width,this.height,this.lenDis)
  },
  watch:{
  	lenDis(val){
  		if(val){
  			this.dataAdapter()
  			this.draw()
  		}
  	}
  },
  methods:{
  	// 用0去插值缺失值
  	dataAdapter(){
  		let maxLen=d3.max(Object.keys(this.lenDis),d=>parseInt(d))
  		for(let i=0;i<maxLen;i++){
  			if(this.lenDis[i]) this.chartData.push([i,this.lenDis[i]])
  			else this.chartData.push([i,0])
  		}
  	}
  }
}

</script>
<style type="text/css" lang="scss" scoped>


</style>
