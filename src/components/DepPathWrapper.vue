<template>
  <div class="dep-path-wrapper" ref="root">
    <dep-path :class="`dep-path-${key}`" v-for="(val,key) in depTotalData.colorMap" :color="val" :type="key" :depData="depTotalData['depInfo'][key+'-paths']" :fileName='depTotalData.depInfo.fileName'></dep-path>
  </div>
</template>
<script type="text/javascript">
import DepPath from './DepPath.vue'
export default {
  data() {
    return {
      depTotalData: {}
    }
  },
  components: { DepPath },
  created() {
    //DepHellWrapper component emit the data which includes 'colorMap' and 'depInfo'
    this.$bus.$on('begin-dep-path', data => {
      this.depTotalData = data
      console.log('begin', data)
    })
  },
  updated() {
    // console.log("updated wrapper")
  },
  mounted() {
    // this.svgWidth = Math.floor(this.$refs.root.clientWidth)
  }
}

</script>
<style type="text/css" lang="scss" scoped>
.dep-path-wrapper {
  display: flex;
  // flex-direction:column;
  .dep-path-long,.dep-path-indirect {
  	flex:1;
  }
  .dep-path-direct{
  	flex:1;
  }
}

</style>
