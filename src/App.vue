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
      <div class="right-panel">
        <partition :root="dependedData" class="partition-chart" type='depended'></partition>
        <partition :root="dependingData" class="partition-chart" type='denpending'></partition>
      </div>
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
import Partition from './components/Partition.vue'
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
    Partition,
    Test
  },
  data() {
    return {
      selectedFileName: 'None',
      treeRoot: null,
      badDeps: null,
      dependedData:null,
      dependingData:null
    }
  },
  updated() {
    console.log('app updated');
  },
  methods: {
    getFolderHierarchy() {
      this.$axios.get('files/getFolderHierarchyAndFileInfo', {
        lenThreshold: 25
      }).then(({ data }) => {
        let treeRoot = d3.hierarchy(data.root);
        treeRoot.descendants().forEach((d)=>{
          d.data.name=this.genRelPath(d.data.name)
        })
        treeRoot.sum(function(d) { return !d.children && d.fileInfo && d.fileInfo.size ? 1 : 0; });
        this.treeRoot=treeRoot

        let badDeps = data.badDeps
        for(let deps of badDeps){
          for(let {path} of deps.paths){
            for(let i=0,len=path.length;i<len;i++){
              path[i]=this.genRelPath(path[i])
            }
          }
        }
        this.badDeps=badDeps
        console.log(this.badDeps)
        console.log('root in app:', this.treeRoot)
      })
    },
    genRelPath(path){
      let match=path.match(/\/Users\/wendahuang\/Desktop\/vue\/src\/(.*)/)
      return match?match[1]:path
    },
    partitionDataAdapter(selectedFile) {
      // 深搜查找节点
      function dfs(root) {
        if (root.data.type === 'file') {
          if (root.data.name === selectedFile)
            return root
          else return null
        }
        for (let i = 0, len = root.children.length; i < len; i++) {
          let res = dfs(root.children[i])
          if (res !== null) return res
        }
        return null
      }
      let fileNode = dfs(this.treeRoot)
      this.dependedData=this.buildHierarchy(fileNode.data.fileInfo.depended)
      this.dependingData=this.buildHierarchy(fileNode.data.fileInfo.depending)
      // this.dependedData=this.buildHierarchy(data.fileInfo.depended)
    },
    buildHierarchy(depends){
      let root={children:[]}
      depends.forEach((dep)=>{
        let child={
          name:dep.file,
          children:[]
        }
        dep.specifiers.forEach((d)=>{
          child.children.push({
            name:d.name,
            type:d.type
          })
        })
        root.children.push(child)
      })
      let treeRoot=d3.hierarchy(root)
      treeRoot.sum(function(d) { return !d.children? 1 : 0; });
      return d3.partition()(treeRoot)
    }
  },
  mounted() {
    this.$bus.$on('file-select', d => this.selectedFileName = d)
    this.$bus.$on('draw-partition', (selectedFile) => {
      this.partitionDataAdapter(selectedFile)
      // this.draw()
    })
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
      flex: 2.5;
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
        flex: 2;
      }
      .right-panel {
        padding: 25px 0;
        flex: 1;
        display:flex;
        flex-direction: column;
        .partition-chart{
          flex:1;
        }
      }
    }
  }
}

</style>
