<template>
  <div class="dep-table">
    <el-table :data="tableData" style="width: 100%" max-height="300" border highlight-current-row
    @current-change="handleCurrentChange" stripe>
      <el-table-column type="index" width="40">
      </el-table-column>
      <el-table-column prop="path" label="Path" :formatter="pathFormatter">
      </el-table-column>
      <el-table-column prop="type" label="Type" width="100" :filters="[{ text: 'Long', value: 'long' }, { text: 'Indirect', value: 'indirect' },{text:'direct',value:'direct'}]" :filter-method="filterType" filter-placement="bottom-end">
        <!--       <template slot-scope="scope">
        <el-tag :type="scope.row.tag === '家' ? 'primary' : 'success'" disable-transitions>{{scope.row.tag}}</el-tag>
      </template> -->
      </el-table-column>
    </el-table>
  </div>
</template>
<script type="text/javascript">
export default {
  data() {
    return {
      tableData: []
    }
  },
  methods: {
    dataAdapter(data) {
      let keys = Object.keys(data.colorMap)
      for (let i = 0; i < keys.length; i++) {
        let type = keys[i],
          color = data.colorMap[type]
        this.tableData = this.tableData.concat(data.depInfo[`${type}-paths`])
      }
      console.log(this.tableData)
    },
    pathFormatter(row, column) {
      return row.path.map(d => (d.match(/[^\\]+$/))[0]).join('=>')
    },
    filterType(value, row) {
      return row.type === value
    },
    handleCurrentChange(val){
    	this.$bus.$emit('highlight-dep',val)
    }
  },
  mounted() {
    //DepHellWrapper component emit the data which includes 'colorMap' and 'depInfo'
    this.$bus.$on('begin-dep-table', data => {
      // console.log(data)
      this.dataAdapter(data)
    })
  }
}

</script>
<style type="text/css" lang="scss">
.dep-table{
  min-height:300px;
}
</style>
