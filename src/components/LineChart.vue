<template>
  <div id="lineChart">
    <svg ref="root"></svg>
  </div>
</template>
<script type="text/javascript">
export default {
  data() {
    return {
    	width:null,
    	height:null
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
  		}
  	}
  },
  methods:{
  	dataAdapter(){
  		
  	}
  }
}

</script>
<style type="text/css" lang="scss" scoped>


</style>
