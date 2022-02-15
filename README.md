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

/*导入vuecmf editor和vuecmf table组件*/
import VuecmfEditor from 'vue-vuecmf-editor'
import VuecmfTable from "vue3-vuecmf-table"

createApp(App).use(VuecmfTable).use(VuecmfEditor).mount('#app')
```

## 模板中使用组件

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
      :operate_width="100"
      :show_detail="true"
      :expand="false"
      :add_form="true"
      :edit_form="true"
      server="http://www.vuecmf.com/vuecmf/admin"
      import_server="http://www.vuecmf.com/vuecmf/admin/saveAll"
      save_server="http://www.vuecmf.com/vuecmf/admin/save"
      upload_server="http://www.vuecmf.com/vuecmf/upload"
      del_server="http://www.vuecmf.com/vuecmf/admin/delete"
      row_key="id"
      default_expand_all="true"
	 
      @exception="vuecmfException"
      @callback="tableCallback"
  >
    <!-- 表格头部左边 自定义按钮操作 -->
    <template #headerAction="selectRows">
      <el-button size="mini" type="primary" @click.prevent="add(selectRows)" >添加</el-button>
    </template>

    <!-- 列表每行 自定义按钮操作 -->
    <template #rowAction="{ row, index}">
      <el-button size="mini" type="danger" @click.prevent="del(row, index)">删除</el-button>
    </template>

    <!-- 每行中的每个字段内容 自定义格式化内容显示： 可获取参数有 { row, field } -->
    <template #formatRow="{ row, field }">
          <span v-if=" field == 'username' ">
              <el-input v-model="row[field]" @change="changeUser" size="small" clearable></el-input>
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
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'vuecmf-table-demo',
  setup(){
     const token = 'd3a777784046e111e6d982a34c32b073'

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

     //行 删除 按钮操作
    const del = (row:any, index:number, service: any):void => {
       console.log(row, index)
	   service.delRow() //调用组件中的服务类实例中方法
      
       console.log('service = ', service)
    }

    //行中输入框修改事件
    const changeUser = (val:string):void => {
       console.log('修改后值=', val)
    }
	
    //列表加载数据异常处理事件
    const vuecmfException = (err_msg: string, code: number):void => {
       console.log(err_msg, code)
    }
	
    //表格回调函数，作用是将 表格组件中的服务类实例暴露出来，便于操作表格数据
    const tableCallback = (tableService:any) => {
       console.log('表格组件中service类实例g', tableService)
    }

     return {
       token,
       selectable,
       add,
       del,
       changeUser,
       vuecmfException,
       tableCallback
     }
  }
});
</script>

```
若列表数据为树形时（即包含 children 字段时），必须设置 row_key 属性（树形数据的唯一键字段名），另还可以设置
default_expand_all属性（是否全部展开）


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
