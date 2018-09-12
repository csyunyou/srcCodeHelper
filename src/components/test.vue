<template>
  <div class="layout" ref="root" >

  </div>
</template>
<script type="text/javascript">
import * as d3 from 'd3'
export default {
  data() {
    return {

    }
  },
  created() {
    console.log('created')
  },
  updated() {
    console.log('updated')
  },
  mounted() {
    console.log('mount')
    const data=[[50,50],[80,80]]
    var svg=d3.select("body").append("svg").attr("width",100).attr("height",100).append("g")
/*    svg.selectAll('circle').data(data).enter().append("circle").attr("cx",d=>d[0]).attr("cy",d=>d[1]).attr("r",10)
    svg.append('path').attr('d',d=>d3.line()(data)).attr("stroke","black")*/
  }
}

</script>
<style type="text/css" lang="scss" scoped>

</style>
