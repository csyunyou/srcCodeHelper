<template>
  <div id="barChart">
    <svg ref="root"></svg>
  </div>
</template>
<script type="text/javascript">
export default{
	data(){
		return{

		}
	},
	props:['chartData'],
	watch:{
		chartData(val){
			if(val){
				this.draw()
			}
		}
	},
	methods:{
		draw(){

		}
	}
}
</script>
<style type="text/css" lang="scss">
	
</style>