<template>
  <div class="dep-path-wrapper" ref="root">
    <div class="overview-path-wrapper">
      <el-tabs type="card">
        <el-tab-pane v-for="(val,key) in depTotalData.colorMap" :label="key">
          <dep-path :class="`dep-path-${key}`" :color="val" :type="key" :depData="depTotalData['depInfo'][key+'-paths']" :fileName='depTotalData.depInfo.fileName' :svgWidth="pSvgWidth" :svgHeight="pSvgHeight"></dep-path>
        </el-tab-pane>
      </el-tabs>
    </div>
    <detail-path></detail-path>
    <!--     <dep-path :class="`dep-path-${key}`" v-for="(val,key) in depTotalData.colorMap" :color="val" :type="key" :depData="depTotalData['depInfo'][key+'-paths']" :fileName='depTotalData.depInfo.fileName'></dep-path> -->
  </div>
</template>
<script type="text/javascript">
import DepPath from './DepPath.vue'
import DetailPath from './DetailPath.vue'
export default {
  data() {
    return {
      depTotalData: {},
      svgWidth: null,
      svgHeight: null,
      tabHeight:75
    }
  },
  components: { DepPath,DetailPath},
  created() {
    //DepHellWrapper component emit the data which includes 'colorMap' and 'depInfo'
    this.$bus.$on('begin-dep-path', data => {
      this.depTotalData = data
      console.log('begin', data)
    })
  },
  computed:{
    pSvgWidth(){
      return this.svgWidth/2
    },
    pSvgHeight(){
      return this.svgHeight-this.tabHeight
    }
  },
  updated() {
    // console.log("updated wrapper")
  },
  mounted() {
    this.svgWidth = Math.floor(this.$refs.root.clientWidth)
    this.svgHeight = Math.floor(this.$refs.root.clientHeight)
    console.log(this.svgHeight,this.svgWidth)
  }
}

</script>
<style type="text/css" lang="scss" scoped>
.dep-path-wrapper {
  display: flex; // flex-direction:column;
  .overview-path-wrapper {
    flex: 1;
    margin-right: 10px;
  }
  .detail-path {
    flex: 1;
    margin-bottom: 10px;
  }
}

</style>
