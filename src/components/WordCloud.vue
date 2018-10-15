<template>
  <div id="wordCloud" class="bl-card-shadow">
    <svg ref="root"></svg>
  </div>
</template>
<script type="text/javascript">
import d3Cloud from 'd3-cloud'
import * as d3 from 'd3'

export default {
  data() {
    return {
      fileNode: null,
      wordLimit: 20,
      width: 0,
      height: 0
    }
  },
  props: ['root'],
  mounted() {
    this.width = Math.floor(this.$refs.root.clientWidth)
    this.height = Math.floor(this.$refs.root.clientHeight)
    this.$bus.$on('draw-wordcloud', (selectedFile) => {
      this.getWordCloudData(selectedFile)
      this.draw()
    })
  },
  methods: {
    getWordCloudData(selectedFile) {
      console.log(this.root, selectedFile)

      function dfs(root) {
        const children = root.children
        for (let i = 0, len = children.length; i < len; i++) {
          if (children[i].data.type === 'dir') {
            const res = dfs(children[i])
            if (res) return res;
          } else {
            if (children[i].data.name === selectedFile) {
              console.log(children[i].data.name)
              return children[i]
            }
          }
        }
        return null
      }
      this.fileNode = dfs(this.root)
      console.log(this.fileNode)
    },
    draw() {
      let vm = this
      const wordCloudData = this.fileNode.data.fileInfo.func,
        fontSizeScale = d3.scaleLinear().range([10, 50]),
        fontWeightScale = d3.scaleQuantize().range([100, 200, 300, 400, 500, 600, 700, 800, 900])
      if (!wordCloudData || wordCloudData.length === 0) return
      d3.select('#wordCloud>svg *').remove()

      /*      var margin = { top: 40, right: 30, bottom: 20, left: 40 },
              width = 470 - margin.left - margin.right,
              height = 390 - margin.top - margin.bottom;*/
      var data = wordCloudData.sort(({ lineNum: a }, { lineNum: b }) => b - a)
      // console.log(data)
      if (data.length > this.wordLimit) data = data.slice(0, this.wordLimit)
      var [minVal, maxVal] = d3.extent(data, d => d.lineNum)
  		console.log(minVal,maxVal)
      // var fontSize = d3.scalePow().exponent(1).domain([minVal, maxVal]).range([10, 80]);
      fontSizeScale.domain([minVal, maxVal])
      fontWeightScale.domain([minVal, maxVal])
      var wordcloud = d3.select(this.$refs.root).append("g")
        .attr('class', 'wordcloud')
        .attr("transform", "translate(" + this.width / 2 + "," + this.height / 1.8 + ")")
      var layout = d3Cloud()
        .timeInterval(10)
        .size([this.width, this.height])
        .words(data)
        .rotate(function(d) { return 0; })
        .font('Impact')
        .fontSize(function(d, i) { return fontSizeScale(d.lineNum); })
        .fontWeight(d => fontWeightScale(d.lineNum))
        .text(function(d) { console.log(d);return d.name; })
        .spiral("archimedean")
        // .random(d => 0.5)
        .padding(d => 6)
        .on("end", draw)
        .start();

      function draw(words) {
        console.log(arguments)
        wordcloud.selectAll("text")
          .data(words)
          .enter().append("text")
          .attr('class', 'word')
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", function(d) { return d.font; })
          .style("fill", function(d) {
            // var paringObject = data.filter(function(obj) { return obj.password === d.text });
            // return color(paringObject[0].category);
            // return vm.colors[vm.selectedCluster+1]
            return "#636363"
          })
          .style("font-weight", d => d.weight)
          .attr("text-anchor", "middle")
          .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
          .text(function(d) { return d.text; })
          .on('click', function(d) {
            d3.selectAll(".word").style("fill", "#636363")
            d3.select(this).style("fill", "#f03b20")
            // vm.$store.commit('SET_SELECTED_WORD', { word: d.text })
          }).each(function(d) {
            /*            d.textLen = this.getComputedTextLength()
                        let sentences = d.sentId.map(idx => vm.allSentences[idx]),
                          pos = sentences.filter(d => d.sentiment === '1'),
                          neg = sentences.filter(d => d.sentiment === '0')
                        d.posPercent = pos.length / sentences.length
                        d.negPercent = neg.length / sentences.length*/
          })

        /*        wordcloud.selectAll("rect").each(function(d) {
                  let sent = d.sentId.map(idx => vm.allSentences[idx]),
                    pos = sent.filter(d => d.sentiment === '1').length,
                    neg = sent.filter(d => d.sentiment === '0').length
                  console.log(d.text, sent.length, pos, neg)
                })*/
        /*       document.querySelectorAll('.word').forEach(function(d){
                console.log(d.innerHTML,d.getComputedTextLength())
               })*/
      };
    }
  }
}

</script>
<style type="text/css" lang="scss" scoped>
#wordCloud {
  svg {
  	width:100%;
    height: 100%;
  }
}

</style>
