# vue3-vuecmf-table

> 基于vue3、Element Plus和TypeScript的多功能列表组件，支持树形列表数据，内置搜索、筛选、分页、行展开、详情、编辑、导出和导入EXCEL等功能

- 示例演示： http://www.vuecmf.com

## 安装

``` bash
# yarn方式安装 vue3-vuecmf-table
yarn add vue3-vuecmf-table

# npm方式安装 vue3-vuecmf-table
npm install vue3-vuecmf-table
```

###1、先在项目中的main.ts 引入
```
import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'

/*导入vuecmf editor、vuecmf dialog和vuecmf table组件*/
import VuecmfEditor from 'vue-vuecmf-editor'
import VuecmfDialog from 'vue-vuecmf-dialog'
import VuecmfTable from "vue3-vuecmf-table"

createApp(App).use(VuecmfTable).use(VuecmfEditor).use(VuecmfDialog).mount('#app')
```

## 模板中使用组件
注意：1.8.0版本开始，show_detail、add_form 和 edit_form 属性被移除，新增加
detail_btn_visible、add_btn_visible、edit_btn_visible 和 del_btn_visible 属性，具体使用见下面实例

```
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
      :add_btn_visible="addBtnVisible"
      :edit_btn_visible="editBtnVisible"
      :del_btn_visible="delBtnVisible"
      :expand_action="true"
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
     const token = '77f0f0181317bd575073bc9e7d9d62d1'

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

      //关联字段下拉列表数据过滤
       /*tableService.table_config.field_filter = {
         model_id: 8
       }*/

      //设置表单中组件的change事件回调函数， 例如在联动下拉框中使用
      tableService.import_config.changeEvent = (form_field_name: string, sel_val: string|Array<string|number>, linkage: any):void => {
        console.log('form_field_name=', form_field_name)
        console.log('sel_val=', sel_val)
        console.log('linkage=', linkage)
      }

    }

    //是否显示行详情按钮, 默认true
    const detailBtnVisible = (row: any): boolean => {
       console.log('row', row)
       return true
    }

    //是否显示添加按钮, 默认true
    const addBtnVisible = (row: any): boolean => {
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
       tableCallback,
       detailBtnVisible,
       addBtnVisible,
       editBtnVisible,
       delBtnVisible
     }
  }
});
</script>

```
若列表数据为树形时（即包含 children 字段时），必须设置 row_key 属性（树形数据的唯一键字段名），另还可以设置
default_expand_all属性（是否全部展开）;
若列表为非树形时，不要设置 row_key 属性，否则列表的分页条不会显示。 


详细使用见 源码中 examples目录中示例

## 后端返回JSON 数据样例：
### 获取列表字段数据API样例
前端POST数据示例
```
{"data":{"action":"getField"}}
```

返回JSON
```
{
    "data":{
        "field_info":[
            {
                "field_id":66,
                "prop":"id",
                "label":"ID",
                "width":100,
                "length":11,
                "show":true,
                "fixed":false,
                "filter":false,
                "tooltip":"自增ID",
                "model_id":8,
                "sortable":true
            },
            ... 此处省略
        ],
        "form_info":{
            "67":{
                "field_id":67,
                "field_name":"username",
                "label":"用户名",
                "type":"text",
                "default_value":"",
                "is_disabled":20,
                "model_field_id":67
            },
            ... 此处省略
        },
        "field_option":{
            "71":{
                "10":"是",
                "20":"否"
            },
            ... 此处省略
        },
        "relation_info":[

        ],
        "form_rules":{
            "username":[
                {
                    "required":true,
                    "message":"用户名必填",
                    "trigger":"blur"
                },
                {
                    "min":4,
                    "max":32,
                    "message":"用户名长度为4到32个字符",
                    "trigger":"blur"
                }
            ],
            ... 此处省略
        },
        "model_id":8
    },
    "msg":"拉取成功",
    "code":0
}
```

### 获取列表数据API样例
前端POST数据示例
```
{
    "data":{
        "page_size":20, //每页显示条数
        "order_field":"", //排序字段名
        "order_sort":"desc", //排序方式
        "keywords":"",  //关键字模糊查询 
        "filter":{   //表单精确查询
			"username": ''
        },
        "offset":0,  //偏移量起始
        "limit":20,  //拉取条数
        "page":1  //当前页
    }
}
```

返回JSON
```
{
    "data":{
        "total":25,  //总条数
        "per_page":20,  //每页显示条数
        "current_page":1, //当前页
        "last_page":2,  //总页数
        "data":[
            {
                "id":26,
                "username":"test025",
                "password":"",
                "email":"test025@test.com",
                "mobile":"18099885535",
                "is_super":20,
                "reg_time":"2021-12-24 15:45:44",
                "reg_ip":"127.0.0.1",
                "last_login_time":"2021-12-24 15:45:44",
                "last_login_ip":"",
                "update_time":"2021-12-24 15:45:44",
                "token":"",
                "status":10,
                "roles":[

                ]
            },
            ...此处省略
        ]
    },
    "msg":"拉取成功",
    "code":0
}
```
