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
      :expand="false"
      :detail_btn_visible="detailBtnVisible"
      :add_btn_visible="true"
      :edit_btn_visible="editBtnVisible"
      :del_btn_visible="delBtnVisible"
      :expand_action="true"
      form_dialog_width="70%"
      server="http://www.vf.com/vuecmf/photo"
      import_server="http://www.vf.com/vuecmf/photo/saveAll"
      save_server="http://www.vf.com/vuecmf/photo/save"
      upload_server="http://www.vf.com/vuecmf/upload"
      del_server="http://www.vf.com/vuecmf/photo/delete"
      @beforeLoadTable="beforeLoadTable"
      @afterLoadTable="afterLoadTable"
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
     const token = '961f4f941f9ecba1fd2197c09b41b101'

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

    //表格数据加载前回调函数，作用是将 表格组件中的服务类实例暴露出来，便于操作表格数据
    const beforeLoadTable = (tableService:any) => {
       console.log('表格组件中service类实例g', tableService)

      //关联字段下拉列表数据过滤
       /*tableService.table_config.field_filter = {
         model_id: 0
       }*/

      //设置表单中组件的change事件回调函数， 例如在联动下拉框中使用
      tableService.import_config.changeEvent = (form_field_name: string, sel_val: string|Array<string|number>, linkage: any):void => {
        console.log('form_field_name=', form_field_name)
        console.log('sel_val=', sel_val)
        console.log('linkage=', linkage)
      }

    }

    //表格字段加载完后
    const afterLoadTable = (table_config: any) => {
       console.log(table_config)
    }


    //是否显示行详情按钮, 默认true
    const detailBtnVisible = (row: any): boolean => {
       console.log('row', row)
       return true
    }

    //是否显示行编辑按钮，默认true
    const editBtnVisible = (row: any): boolean => {
      console.log('row', row)
      return true
    }

    //是否显示行删除按钮，默认true
    const delBtnVisible = (row: any): boolean => {
      console.log('row', row)
      return true
    }

     return {
       token,
       selectable,
       add,
       lock,
       changeUser,
       beforeLoadTable,
       afterLoadTable,
       detailBtnVisible,
       editBtnVisible,
       delBtnVisible
     }
  }
});
</script>


