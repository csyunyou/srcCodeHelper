<template>
  <div id="app">
    <!-- <chord-chart></chord-chart> -->
    <!-- <div class="left-panel" ref="leftPanel"> -->
      <dep-hell-wrapper class="left-panel"></dep-hell-wrapper>
      <!-- <dep-path-wrapper class="mid-panel"></dep-path-wrapper> -->
      <div class="right-panel">
        <div class="title">Currently selected file:<span class="selected-file">{{selectedFileName}}</span></div>
        <dep-table class="dep-table"></dep-table>
        <dep-path-wrapper class="dep-path-wrapper"></dep-path-wrapper>
      </div>
      <!-- <test></test> -->
    <!-- <div class="right-panel"></div> -->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld'
import ChordChart from './components/ChordChart.vue'
import DepHellWrapper from './components/DepHellWrapper.vue'
import DepPathWrapper from './components/DepPathWrapper.vue'
import DepTable from './components/DepTable.vue'
import Test from './components/test.vue'
export default {
  name: 'App',
  components: {
    HelloWorld,
    ChordChart,
    DepHellWrapper,
    DepPathWrapper,
    DepTable,
    Test
  },
  data(){
    return{
      selectedFileName:'None'
    }
  },
  mounted(){
    console.log(this.$refs.leftPanel)
    this.$bus.$on('file-select',d=>this.selectedFileName=d)
  }
}
</script>

<style lang="scss" type="text/css">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  display: flex;
  /*height: 100%;*/
  margin-top: 60px;
  .left-panel{
    flex:1;
  }
/*   .mid-panel{
    flex:1;
  } */
  .right-panel{
    flex:2;
    display: flex;
    flex-direction:column;
    .selected-file{
      font-weight: bold;
    }
    .dep-table{
      flex:none;
    }
    .dep-path-wrapper{
      flex:auto;
    }
  }
}
</style>
