<template>
    <div class="parentBox">
      <h1>otherListInfo页面</h1>
      <Modal></Modal>

      <h1>{{fullName}}</h1>
      <input type="text" v-model.trim="firstName">
    </div>
</template>

<script>
  import Modal from "./modal"
    export default {
        name: "otherListInfo",
      components:{
        Modal
      },
      data(){
          return{
            city : "shanghai",
            firstName: 'Dawei',
            lastName: 'Lou',
            fullName: ''
          }
      },
      watch:{
        firstName(newName,oldName){
          this.fullName = newName+' ' + this.lastName
        }
      }
    }
</script>

<style scoped>
  .parentBox{
    width: 500px;
    height: 300px;
    /*background: #f00;*/
  }
  h1{
    font-size:30px;
  }

</style>
