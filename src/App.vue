<template>
  <div id="app">
    <!-- <chord-chart></chord-chart> -->
    <!-- <div class="left-panel" ref="leftPanel"> -->
    <div class="left-panel column">
      <line-chart class="line-chart" :lenDis="lenDis" :lenThreshold='lenThreshold' :maxLen='maxLen'
      @filterLongDep='filterLongDep'>
      </line-chart>
      <bar-chart class="bar-chart" :chartData="barChartData" :colorMap="colorMap"></bar-chart>
      <dep-hell-wrapper :root="treeRoot" :badDeps="badDeps" class="dep-hell-wrapper" :colorMap="colorMap">
      </dep-hell-wrapper>
    </div>
    <div class="right-panel column">
      <div class="row">
        <div class="left-panel bl-card-shadow">
          <div class="title">Currently selected file:<span class="selected-file">{{selectedFileName}}</span></div>
          <dep-table class="dep-table"></dep-table>
          <dep-path-wrapper class="dep-path-wrapper" :lenThreshold="lenThreshold"></dep-path-wrapper>
        </div>
          <code-chart class="right-panel bl-card-shadow"></code-chart>
      </div>
      <div class="row">
        <parallel-coordinate :root="treeRoot" class='parallel-coordinate'></parallel-coordinate>
        <word-cloud :root="treeRoot" class="word-cloud"></word-cloud>
        <!--         <div class="partition-layout">
          <partition :root="dependedData" class="partition-chart" type='depended'></partition>
          <partition :root="dependingData" class="partition-chart" type='denpending'></partition>
        </div> -->
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
import LineChart from './components/LineChart.vue'
import BarChart from './components/BarChart.vue'
import CodeChart from './components/CodeChart.vue'
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
    LineChart,
    BarChart,
    CodeChart,
    Test
  },
  data() {
    return {
      selectedFileName: 'None',
      treeRoot: null,
      badDeps: null,
      dependedData: null,
      dependingData: null,
      lenDis: null,
      colorMap: { long: '#e41a1c', indirect: '#4daf4a', direct: '#377eb8' },
      lenThreshold:25,
      // lenThreshold:16,
      maxLen:9999
    }
  },
  updated() {
    console.log('app updated');
  },
  computed: {
    barChartData() {
      return this.badDeps ? this.badDeps.map(d => ({ type: d.type, num: d.paths.length })) : null
    }
  },
  methods: {
    // 通过slider改变len阈值时，重新向后台请求数据
    filterLongDep(val){
      this.lenThreshold=val
      this.getFolderHierarchy()
    },
    getFolderHierarchy() {
      this.$axios.get('files/getFolderHierarchyAndFileInfo', {
        lenThreshold: this.lenThreshold,
        libName:'vue'
        // libName:'d3'
      }).then(({ data }) => {
        let treeRoot = d3.hierarchy(data.root);
        console.log('leaves num:',treeRoot.leaves().length)
        treeRoot.descendants().forEach((d) => {
          // 提取相对路径
          d.data.name = this.genRelPath(d.data.name)
          if (d.data.type === 'dir') return
          // 若是文件，则提取该文件的依赖文件和被依赖文件的相对路径
          d.data.fileInfo.depended = d.data.fileInfo.depended.map(dep => Object.assign({},
            dep, { src: this.genRelPath(dep.src) }))
          d.data.fileInfo.depending = d.data.fileInfo.depending.map(dep => Object.assign({},
            dep, { src: this.genRelPath(dep.src) }))
        })
        treeRoot.sum(function(d) { return !d.children && d.fileInfo && d.fileInfo.size ? 1 : 0; });
        this.treeRoot = treeRoot

        // 提取所有坏依赖的相对路径
        let badDeps = data.badDeps
        for (let deps of badDeps) {
          for (let { path } of deps.paths) {
            for (let i = 0, len = path.length; i < len; i++) {
              path[i] = this.genRelPath(path[i])
            }
          }
        }
        this.badDeps = badDeps
        this.lenDis = data.lenDis
        this.maxLen=badDeps.find(d=>d.type==='long').maxLen
        // console.log(this.lenDis)
        console.log(this.badDeps)
        console.log('root in app:', this.treeRoot)
      })
    },
    genRelPath(path) {
      let match = path.match(/\/Users\/wendahuang\/Desktop\/vue\/src\/(.*)/)
      return match ? match[1] : path
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
      this.dependedData = this.buildHierarchy(fileNode.data.fileInfo.depended)
      this.dependingData = this.buildHierarchy(fileNode.data.fileInfo.depending)
      // this.dependedData=this.buildHierarchy(data.fileInfo.depended)
    },
    buildHierarchy(depends) {
      console.log(depends)
      let root = { children: [] }
      depends.forEach((dep) => {
        let child = {
          name: dep.src,
          children: []
        }
        dep.specifiers.forEach((d) => {
          child.children.push({
            name: d.name,
            type: d.type
          })
        })
        root.children.push(child)
      })
      let treeRoot = d3.hierarchy(root)
      treeRoot.sum(function(d) { return !d.children ? 1 : 0; });
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
  .left-panel {
    margin-right: 10px;
    // padding: 0 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    .line-chart {
      flex: 1;
      margin-bottom: 10px;
    }
    .bar-chart {
      flex: 1;
      margin-bottom: 10px;
    }
    .dep-hell-wrapper {
      // margin-top: 30px;
      flex: 5;
    }
  }
  .right-panel {
    flex: 3;
    display: flex;
    flex-direction: column;
    .row {
      &:nth-child(1) {
        flex: 3;
        display: flex;
        .left-panel {
          padding: 10px 10px 10px 10px;
          flex: 2;
          display: flex;
          flex-direction: column;
          .title{
            font-weight: bold;
            .selected-file{
              text-decoration: underline;
              font-style: italic;
            }
          }
          .dep-table {
            flex: none;
            margin-bottom: 10px;
          }
          .dep-path-wrapper {
            flex: 1;
          }
        }
        .right-panel {
          flex: 1;
          max-width:463px;
          // max-height:500px;
        }
        margin-bottom: 10px;

      }
      &:nth-child(2) {
        flex: 1.2;
        display: flex;
        .parallel-coordinate {
          flex: 3;
          margin-right: 10px;
        }
        .word-cloud {
          flex: 1;
        }
        .partition-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          .partition-chart {
            flex: 1;
          }
        }
      }
    }
  }
}

</style>
