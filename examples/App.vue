<template>
  <h3>vuecmf-table demo</h3>

  <vuecmf-table
      size="default"
      export_file_name="管理员列表"
      height="400px"
      :selectable="selectable"
      :checkbox="true"
      :token="token"
      page="page"
      :limit="20"
      :operate_width="158"
      :show_detail="true"
      :expand="false"
      :add_form="true"
      :edit_form="true"
      server="http://www.vf.com/vuecmf/admin"
      import_server="http://www.vf.com/vuecmf/admin/saveAll"
      save_server="http://www.vf.com/vuecmf/admin/save"
      upload_server="http://www.vf.com/admin/upload"
      del_server="http://www.vf.com/vuecmf/admin/delete"
      @callback="tableCallback"
  >
    <!-- 表格头部左边 自定义按钮操作 -->
    <template #headerAction="selectRows">
      <el-button size="default" type="danger" @click.prevent="mulDel(selectRows)" >批量删除</el-button>
    </template>

    <!-- 列表每行 自定义按钮操作 -->
    <template #rowAction="{ row, index, service}">
      <el-button size="default" type="info" @click.prevent="lock(row, index, service)">禁用</el-button>
    </template>

    <!-- 每行中的每个字段内容 自定义格式化内容显示： 可获取参数有 { row, field } -->
    <template #formatRow="{ row, field }">
          <span v-if=" field == 'username' ">
              <el-input v-model="row[field]" @change="changeUser" size="default" clearable></el-input>
          </span>
    </template>

    <!-- 行展开 自定义格式-->
    <template #rowExpand="{ row, index }">
      <div :key="k" v-for="(item,k) in row.expand_data.table_list">
        {{ item.col01 }} {{ item.col02 }} {{ index }}
      </div>
    </template>


  </vuecmf-table>

</template>

<script lang="ts">
import {defineComponent} from 'vue';


export default defineComponent({
  name: 'App',
  setup(){
     const token = 'd27067889324bbc0c522f712a40f8e98'

     const selectable = (row: any, index: number):boolean => {
       if(typeof row.username != 'undefined' && index > 0){
         //为true则行可勾选
         return true
       }else{
         return false
       }
     }

     //表格头部左边 添加 按钮操作
     const add = (rows:any):void => {
        Object.keys(rows).forEach((key) => {
           console.log(rows[key])
        })
     }

    //行 禁用 按钮操作, row = 行数据， index = 行索引， service = 组件的服务类实例
    const lock = (row:any, index:number, service: any):void => {
       console.log(row, index)

       service.delRow() //调用组件中的服务类实例中方法

       console.log('service = ', service)
    }

    //行中输入框修改事件
    const changeUser = (val:string):void => {
       console.log('修改后值=', val)
    }

    //表格回调函数，作用是将 表格组件中的服务类实例暴露出来，便于操作表格数据
    const tableCallback = (tableService:any) => {
       console.log('表格组件中service类实例g', tableService)
    }

     return {
       token,
       selectable,
       add,
       lock,
       changeUser,
       tableCallback
     }
  }
});
</script>


