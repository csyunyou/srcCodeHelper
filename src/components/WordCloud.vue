<template>
	<div id="word-cloud">
	</div>
</template>
<script type="text/javascript">
export default{
	data(){
		return{

		}
	},
	props:['root'],
	mounted(){
		this.$bus.$on('draw-wordcloud',(selectedFile)=>{
			console.log(selectedFile)
		})
	}
}
</script>
<style type="text/css" lang="scss" scoped>
	
</style>