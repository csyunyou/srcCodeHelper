<template>
  <div id="app">
    <!-- <chord-chart></chord-chart> -->
    <!-- <div class="left-panel" ref="leftPanel"> -->
    <div class="row">
      <dep-hell-wrapper class="left-panel" :root="treeRoot" :badDeps="badDeps"></dep-hell-wrapper>
      <div class="mid-panel">
        <div class="title">Currently selected file:<span class="selected-file">{{selectedFileName}}</span></div>
        <dep-table class="dep-table"></dep-table>
        <dep-path-wrapper class="dep-path-wrapper"></dep-path-wrapper>
      </div>
      <div class="right-panel">
        <word-cloud :root="treeRoot" class="word-cloud"></word-cloud>
        <div class="other"></div>
      </div>
    </div>
    <div class="row">
      <parallel-coordinate :root="treeRoot" class='left-panel'></parallel-coordinate>
      <div class="right-panel"></div>
    </div>
    <!-- <test></test> -->
    <!-- <div class="right-panel"></div> -->
  </div>
</template>
<script>
import * as d3 from 'd3'
import HelloWorld from './components/HelloWorld'
import ChordChart from './components/ChordChart.vue'
import DepHellWrapper from './components/DepHellWrapper.vue'
import DepPathWrapper from './components/DepPathWrapper.vue'
import DepTable from './components/DepTable.vue'
import WordCloud from './components/WordCloud.vue'
import ParallelCoordinate from './components/ParallelCoordinate.vue'
import Test from './components/test.vue'
export default {
  name: 'App',
  components: {
    HelloWorld,
    ChordChart,
    DepHellWrapper,
    DepPathWrapper,
    DepTable,
    WordCloud,
    ParallelCoordinate,
    Test
  },
  data() {
    return {
      selectedFileName: 'None',
      treeRoot: null,
      badDeps: null
    }
  },
  updated() {
    console.log('app updated');
  },
  methods: {
    getFolderHierarchy() {
      this.$axios.get('files/getFolderHierarchyAndFileInfo', {
        lenTreshold: 22
      }).then(({ data }) => {
        this.treeRoot = d3.hierarchy(data.root);
        console.log(this.treeRoot)
        this.treeRoot.sum(function(d) { return !d.children && d.fileInfo && d.fileInfo.size ? 1 : 0; });
        this.badDeps = data.badDeps
        console.log('root in app:', this.treeRoot)
      })
    }
  },
  mounted() {
    this.$bus.$on('file-select', d => this.selectedFileName = d)
    this.getFolderHierarchy()
  }
}

</script>
<style lang="scss" type="text/css">
html {
  height: 100%;
  body {
    height: 100%;
  }
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  display: flex;
  height: 100%;
  flex-direction: column;
  .row {
    &:nth-child(1) {
      flex: 2;
      display: flex;
      .left-panel {
        flex: 1.3;
      }
      .mid-panel {
        flex: 2;
        display: flex;
        flex-direction: column;
        .selected-file {
          font-weight: bold;
        }
        .dep-table {
          flex: none;
        }
        .dep-path-wrapper {
          flex: auto;
        }
      }
      .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        .word-cloud {
          flex: 1;
        }
        .other {
          flex: 1;
        }
      }
    }
    &:nth-child(2) {
      flex: 1;
      display: flex;
      .left-panel {
        flex: 2
      }
      .right-panel {
        flex: 1
      }
    }
  }
}

</style>
