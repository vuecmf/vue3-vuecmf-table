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
      server="http://www.vuecmf.com/vuecmf/vuecmf/test"
      import_server="http://www.vuecmf.com/vuecmf/vuecmf/test/saveAll"
      save_server="http://www.vuecmf.com/vuecmf/vuecmf/test/save"
      upload_server="http://www.vuecmf.com/vuecmf/vuecmf/test/upload"
      del_server="http://www.vuecmf.com/vuecmf/vuecmf/test/delete"
      @beforeLoadTable="beforeLoadTable"
      @afterLoadTable="afterLoadTable"
      show_type="table"
      :upload_action="uploadAction"
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

  <el-dialog
      v-model="dialogVisible"
      title="上传文件"
      width="50%"
  >
    <span>此处可以自定义上传组件或接入外部文件管理器组件，如<a href="https://github.com/vuecmf/vue-vuecmf-fileexplorer" target="_blank">vue-vuecmf-fileexplorer</a><br>
    若直接本地文件上传，去掉vuecmf-table组件中upload_action属性即可。
    </span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFile">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

export default defineComponent({
  name: 'App',
  setup(){
     const token = '2bfdcc6e7b614934972e91a7b0ce80bb'

     const selectable = (row: any, index: number):boolean => {
       if(typeof row.username != 'undefined' && index > 0){
         //为true则行可勾选
         return true
       }else{
         return false
       }
     }

     //批量删除
     const mulDel = (rows: any):void => {
       console.log(rows)
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

    const fileData = ref()  //文件信息数据
    const dialogVisible = ref(false) //上传弹窗
    const fromEditor = ref(false) //是否来自编辑器上传
    //上传动作，触发打开自定义的上传弹窗
    const uploadAction = (data: any, field: any): void => {
      fileData.value = data
      dialogVisible.value = true

      fromEditor.value = false
      if(field == 'editor'){
        fromEditor.value = true
      }

      console.log('值：',data)
      console.log('字段：', field)
    }
    //保存文件信息，如可将文件管理器中选择的文件信息保存
    const saveFile = ():void => {
       if(fromEditor.value){
         fileData.value.url = 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/300'
       }else{
         fileData.value.push({
           field_name: 'photo_url',
           name: '200.jpg',
           url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg'
         })
         fileData.value.push({
           field_name: 'photo_url',
           name: '201.jpg',
           url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/300'
         })
       }


      dialogVisible.value = false
    }

     return {
       token,
       selectable,
       mulDel,
       add,
       lock,
       changeUser,
       beforeLoadTable,
       afterLoadTable,
       detailBtnVisible,
       editBtnVisible,
       delBtnVisible,
       uploadAction,

       dialogVisible,
       saveFile
     }
  }
});
</script>


