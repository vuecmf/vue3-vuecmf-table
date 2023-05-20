# vue3-vuecmf-table

> 基于vue3、Element Plus和TypeScript的多功能列表组件，支持树形列表数据，内置搜索、筛选、分页、行展开、详情、编辑、导出和导入EXCEL等功能

- 示例演示： http://www.vuecmf.com

## 版本变更日志
注意：

1.8.0版本开始，show_detail、add_form 和 edit_form 属性被移除，新增加
detail_btn_visible、add_btn_visible、edit_btn_visible 和 del_btn_visible 属性，具体使用见下面实例

1.9.0版本开始callback事件移除，增加 beforeLoadTable 和 afterLoadTable 事件

1.10.0版本开始，后端api获取的字段信息中 relation_info 中增加 full_options项，供列表中关联字段值转换显示内容用

1.14.0版本开始，后端api获取的字段信息中 field_option项 和 relation_info 中的 full_options项 及 options 项 的数据结构全部调整为统一的格式，如下
```
#1.14.0 以前版本
"field_option":{
    "71":{
        "10":"是",
        "20":"否"
    },
    ... 此处省略
},

#1.14.0版本开始
"field_option":{
    "71":[
        {
            "value": 10,
            "label": "是"
        },
        {
            "value": 20,
            "label": "否"
        }
    ],
    ... 此处省略
},
```

1.14.5版本开始，后端api获取的字段信息的 form_info 中的 is_disabled 调整为 true 或 false; true则表单控件为禁用状态，false则是可用状态
```
#1.14.5 以前版本
"form_info":{
            "67":{
                "field_id":67,
                "field_name":"username",
                "label":"用户名",
                "type":"text",
                "default_value":"",
                "is_disabled":20,   #表单中未使用
                "model_field_id":67
            },
            ... 此处省略
        },

#1.14.5版本开始
"form_info":{
            "67":{
                "field_id":67,
                "field_name":"username",
                "label":"用户名",
                "type":"text",
                "default_value":"",
                "is_disabled": false, #值为true或false, 并已应用到表单的可用与禁用
                "model_field_id":67
            },
            ... 此处省略
        },
```

1.15.x 增加属性如下
```
date_format：日期控件显示格式, 默认 YYYY-MM-DD
date_value_format：日期控件保存的值格式, 默认 YYYY-MM-DD
datetime_format：日期时间控件显示格式, 默认 YYYY-MM-DD HH:mm:ss
datetime_value_format：日期时间控件保存的值格式, 默认 YYYY-MM-DD HH:mm:ss
以上属性的值设置同element-plus中Date Picker控件的format和value_format设置 https://element-plus.org/en-US/component/date-picker.html#attributes
```

1.16.x 增加属性如下
```
show_type：列表显示方式 （默认table, 可选值： table  card）
```

1.17.x 增加如下
```
1、传给后端的参数，增加了可选的 扩展参数extend_params， 与data参数并列关系。
例如当前组件服务实例为 service, 若要添加扩展参数，参考如下
service.table_config.extend_params = {
    wid: 'xxxxxx',
    model: 'xxxx'
}
此时调用后端API时，POST的json就会是如下形式
{
  data: {....}
  wid: 'xxxxxx',
  model: 'xxxx' 
}

2、后端获取字段接口返回的字段信息中增加了code字段，若code=true时，列表中查看详情页面的 对应字段就会在多行文本框中显示HMTL源代码。
如下
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
                "code": false,   //新增 是否显示HTML源码
                "tooltip":"自增ID",
                "model_id":8,
                "sortable":true
            },
  ... 此处省略
}
```

1.18.x版本开始增加 beforeLoadData 和 afterLoadData 事件
```
beforeLoadData： 列表数据加载前，接收到的参数为表格的 table_config 对象
afterLoadData： 列表数据加载完成后，接收到的参数为列表的data数据对象

```

1.19.x版本开始表单增加color_picker(颜色选择器)类型, 详情中显示源码的增加高亮显示样式
```
"form_info":{
            "67":{
                "field_id":67,
                "field_name":"nav_background",
                "label":"导航条背景色",
                "type":"color_picker",  //新增 color_picker 颜色选择器 
                ...
            },
            ... 此处省略
        },
```

1.20.x版本开始详情中，鼠标放在是显示源码的内容上时，会显示“复制”按钮功能

1.21.x版本开始，增加函数类属性upload_action，即可自定义表单中的上传文件功能，如接入外部文件管理器组件。具体使用可查examples

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

/* v1.21+版本开始需要导入此图标样式 */
import "bootstrap-icons/font/bootstrap-icons.css" 

/*导入vuecmf editor、vuecmf dialog和vuecmf table组件*/
import VuecmfEditor from 'vue-vuecmf-editor'
import VuecmfDialog from 'vue-vuecmf-dialog'
import VuecmfTable from "vue3-vuecmf-table"

createApp(App).use(VuecmfTable).use(VuecmfEditor).use(VuecmfDialog).mount('#app')
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
      :operate_width="158"
      :expand="false"
      :detail_btn_visible="detailBtnVisible"
      :add_btn_visible="true"
      :edit_btn_visible="editBtnVisible"
      :del_btn_visible="delBtnVisible"
      :expand_action="true"
      form_dialog_width="70%"
      server="http://www.vf.com/vuecmf/admin"
      import_server="http://www.vf.com/vuecmf/admin/saveAll"
      save_server="http://www.vf.com/vuecmf/admin/save"
      upload_server="http://www.vf.com/admin/upload"
      del_server="http://www.vf.com/vuecmf/admin/delete"
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
     const token = 'e4e882a6c6750937e874e3ace7cde31d'

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
         model_id: 8
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
                "is_disabled": false,
                "model_field_id":67
            },
            ... 此处省略
        },
        "field_option":{
            "71":[
                {
                    "value": 10,
                    "label": "是"
                },
                {
                    "value": 20,
                    "label": "否"
                }
            ],
            ... 此处省略
        },
        "relation_info":[
            full_options: {},
            linkage: {},
            options: {}
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
