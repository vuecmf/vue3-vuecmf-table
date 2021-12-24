<template>

  <el-row :gutter="10" >
    <el-col :xs="24" :sm="8" :md="10" :lg="12" :xl="12"  class="btn-group">
      <slot name="headerAction" :selectRows="select_rows"></slot>
    </el-col>
    <el-col :xs="24" :sm="16" :md="14" :lg="12" :xl="12" class="table-tools">
      <el-row justify="end">
            <el-input size="small" placeholder="请输入内容" v-model="keywords" @change="search" clearable></el-input>
            <el-button type="default" size="small" title="刷新" @click="search"><el-icon><icon-refresh /></el-icon></el-button>

            <!--<el-button type="default" size="small" title="日历"><i class="fa fa-calendar"></i></el-button>
            <el-button type="default" size="small" title="透视" @click="pivot"><i class="fa fa-table"></i></el-button>
            <el-button type="default" size="small" title="图表"><i class="fa fa-bar-chart"></i></el-button>
            <el-button type="default" size="small" title="看板"><i class="fa fa-th-large"></i></el-button>-->

            <el-dropdown trigger="click" >
              <el-button type="default" size="small" title="列">
                <el-icon><grid /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-checkbox-group v-model="check_column_list" class="dropdown-content" @change="toggleColumn">

                    <el-checkbox :key="index"  :label="item.label" v-for="(item,index) in columns">
                      <span v-html="item.label"></span>
                    </el-checkbox>

                  </el-checkbox-group>
                </el-dropdown-menu>
              </template>

            </el-dropdown>

            <el-button type="default" size="small"  title="导入" @click="import_dlg = true"><el-icon><upload /></el-icon></el-button>

            <el-dropdown trigger="click" @command="downloadExport">
              <el-button type="default" size="small" title="导出">
                <el-icon><download /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="xlsx">XLSX工作表</el-dropdown-item>
                  <el-dropdown-item command="csv">CSV文档</el-dropdown-item>
                  <el-dropdown-item command="txt">TXT文本文档</el-dropdown-item>
                  <el-dropdown-item command="xml">XML文档</el-dropdown-item>
                </el-dropdown-menu>
              </template>

            </el-dropdown>
      </el-row>

    </el-col>
  </el-row>

  <el-table
      :data="table_data"
      border
      style="width: 100%"
      size="small"
      @sort-change="sort"
      v-loading="loading"
      :stripe="true"
      :height="height"
      @select="currentSelect"
      @selection-change="getSelectRows"
  >
    <!-- 行选择 -->
    <el-table-column fixed type="selection" :selectable="selectable" width="50" v-if="checkbox"></el-table-column>

    <!-- 列头及列表展示 -->
    <template v-for="(item,index) in columns">
      <el-table-column v-if="item.show"
                       :prop="item.prop"
                       :label="item.label"
                       :sortable="item.sortable"
                       :fixed= "item.fixed"
                       :width="item.width"
                       :key="index"
      >
        <!-- 列头自定义 -->
        <template #header>
          <span class="header-label">{{ item.label }}</span>
          <el-tooltip v-if="item.tooltip" placement="bottom" effect="dark">
            <el-icon size="24"><question-filled /></el-icon>
            <template #content >
              <div><span v-html="item.tooltip"></span></div>
            </template>
          </el-tooltip>
          <div>
            <template v-if="item.filter">
              <el-select v-model="filter_form[item.prop]" multiple collapse-tags placeholder="请选择" v-if=" typeof field_options[item.field_id] != 'undefined'" size="small">
                <el-option
                    v-for="(option_val,option_key) in field_options[item.field_id]"
                    :key="option_key"
                    :label="option_val"
                    :value="option_key"
                >
                </el-option>
              </el-select>
              <el-date-picker size="small" format="YYYY-MM-DD" v-model="filter_form[item.prop]" type="daterange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" v-else-if=" typeof form_info[item.field_id] != 'undefined' && (form_info[item.field_id].type == 'date' || form_info[item.field_id].type == 'datetime')">
              </el-date-picker>
              <el-input
                  v-model="filter_form[item.prop]"
                  size="small"  clearable
                  placeholder="输入关键字搜索" v-else />
            </template>
          </div>
        </template>

        <!-- 格式化列表内容显示 -->
        <template #default="scope">
          <slot name="formatRow" :row="scope.row" :field="item.prop" >
            <span v-html="formatter(item.field_id, scope.row[item.prop])"></span>
          </slot>
        </template>

      </el-table-column>
    </template>

    <!-- 行操作 -->
    <el-table-column fixed="right" label="操作" :width="operate_width" v-if="operate_width">
      <template #default="scope" >
        <el-button size="mini" type="success" @click.prevent="editRow(scope.row)" v-if="edit_form">编辑</el-button>
        <slot name="rowAction" :row="scope.row" :index="scope.$index"></slot>
      </template>
    </el-table-column>

    <!-- 行展开 -->
    <el-table-column type="expand" fixed="left" v-if="expand">
      <template #default="props">
        <!-- 表格行展开自定义 -->
        <slot name="rowExpand" :row="props.row" :index="props.$index">
          <el-table border :data="props.row.expand_data.table_list" size="small" :stripe="true" >

            <el-table-column :prop="item.prop" :label="item.label" :width="item.width" :key="index" v-for="(item,index) in props.row.expand_data.table_fields">
              <template #default="expand_scope">
                  <span  v-html="expand_scope.row[item.prop]"></span>
              </template>
            </el-table-column>

          </el-table>
        </slot>


      </template>
    </el-table-column>

  </el-table>

  <div class="pagination">
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="current_page"
        :page-sizes="[5,20,30,40,50,100,200,300,500,1000]"
        :page-size="page_size"
        :layout="page_layout"
        :pager-count="5"
        :total="total">
    </el-pagination>
  </div>

  <!-- 下载数据 -->
  <el-dialog
      title="正在下载数据，请稍后..."
      v-model="show_download_dlg"
      width="30%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
  >
    <span class="danger">{{ download_error }}</span>
    <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage"></el-progress>
  </el-dialog>

  <!-- 导入数据 -->
  <el-dialog v-model="import_dlg" title="导入" custom-class="import-dlg" @close="search">
    <el-row justify="space-between">
      <el-col :span="12" class="import-form">
        <form ref="import_data_form">
          <input type="file" ref="import_file_form" class="file-form" @change="importExcel"  accept=".xlsx, .xls">
          <el-button  type="primary" @click="triggerUpload" size="small">选择文件</el-button>
        </form>
      </el-col>

      <el-col :span="12" class="download-tpl-btn">
        <el-button  type="success"  @click="downloadTemplate" size="small" >下载模板</el-button>
      </el-col>
    </el-row>

    <el-row>
      <el-col v-if=" import_file_name != '' " class="upload-tips">
        <div>当前选择文件:  {{ import_file_name }}</div>
        <div v-html="parse_data_tips"></div>
        <div v-if=" import_file_error != '' ">
          <div class="danger" v-html="import_file_error"></div>
        </div>
      </el-col>
      <el-col class="upload-progress">
        <el-progress  :text-inside="true"  status="success"  :stroke-width="18" :percentage="import_percentage"></el-progress>
      </el-col>
    </el-row>

    <template #footer>
      <el-button type="default" size="small"  @click="search">关闭</el-button>
      <el-button type="primary" size="small"  @click="startImportData" :disabled=" is_import_disabled ">开始</el-button>
    </template>
  </el-dialog>

  <!-- 编辑表单 -->
  <el-dialog v-model="edit_dlg" title="编辑" @close="search">

  </el-dialog>


</template>

<script lang="ts" setup>
import Service from './Service'
import {toRefs, defineProps} from "vue"

const props = defineProps([
  "export_file_name",  //导出的文件名称
  "import_server",  //导入数据的后端API链接
  "token",     //后端需要的token信息
  "selectable",  //行是否可选回调函数
  "checkbox",  //是否显示行选择复选框
  "server",   //加载列表数据的后端API链接
  "page",  //当前页码的参数名
  "limit",  //每页显示条数
  "height",  //列表表格高度
  "operate_width",  //操作列的宽度
  "edit_form", //是否显示行编辑功能
  "expand"   //是否显示行展开功能
])

const {limit, server, page, token, export_file_name, import_server} = toRefs(props)


const service = new Service({
  limit: limit,
  server: server,
  page: page,
  token: token,
  export_file_name: export_file_name,
  import_server: import_server
})


const {
  loading,
  check_column_list, //列显示

  filter_form,  //筛选表单
  keywords,  // 关键字搜索
  field_options,
  form_info,

  //分页设置
  page_layout,
  current_page,
  page_size,
  total,

  //列数据相关
  table_data,
  columns,
  select_rows, //已选择的所有行数据
  current_select_row, //当前选择的一行数据
  edit_dlg,  //编辑表单对话框

} = service.getConfig('table_config')

const {
  import_dlg, //是否显示导入对话框
  import_data_form, //导入表单ref
  import_file_form, //file表单ref
  parse_data_tips, //解析数据时提示
  import_file_name, //当前导入文件名
  import_file_error, //导入异常提示语句
  is_import_disabled, //开始按钮是否禁用
  import_percentage, //导入进度百分比

} = service.getConfig('import_config')

const {
  show_download_dlg, //下载进度提示框的显示与隐藏
  percentage,        //下载进度
  download_error,    //下载错误提示
} = service.getConfig('export_config')


//事件方法
const search = service.search  //搜索
const toggleColumn = service.toggleColumn //显示或隐藏列
const sort = service.sort  //排序
const handleSizeChange = service.handleSizeChange //修改每页显示条数
const handleCurrentChange = service.handleCurrentChange //切换当前页码
const formatter = service.formatter  //格式化字段显示

const downloadExport = service.downloadExport  //导出文件

const downloadTemplate = service.downloadTemplate  //下载导入模板文件
const triggerUpload = service.triggerUpload  //触发上传
const importExcel = service.importExcel   //读取文件并解析数据
const startImportData = service.startImportData //开始上传

const currentSelect = service.currentSelect  //当前选择行事件
const getSelectRows = service.getSelectRows  //获取所有选择的数据

const editRow = service.editRow   //显示行编辑表单

service.mounted()

</script>

<script lang="ts" >
import { defineComponent } from 'vue'

import {
  Download,
  Upload,
  Grid,
  Refresh as IconRefresh,
  QuestionFilled,

} from '@element-plus/icons-vue'

export default defineComponent({
  name: 'vuecmf-table',
  components: {
    Download, Upload, Grid, IconRefresh, QuestionFilled
  }
});
</script>

<style lang="scss" scoped>

/* 列表工具栏 */
/* 左边工具栏 */
.btn-group, .table-tools{
  margin-bottom: 10px;
}
.btn-group {
  text-align: left; padding-top: 3px;
}
/* 右边工具栏 */
.table-tools {
  text-align: right;

  .el-input--small{
    width: auto;
    :deep(.el-input__inner) {
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
  }

  .el-button {
    margin-left: -1px !important;
    border-radius: 0px;
    height: 32px;
    line-height: 16px;
  }
  .el-button:focus {
    border-color: #b3d8ff !important;
  }

  .el-dropdown:last-child .el-button {
    border-top-right-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
  }
}
.dropdown-content {
  max-height: 260px;
  max-width: 560px;
  width: 100%;
  :deep(.el-checkbox) {
    display: block;
    float: left;
    padding:0 10px;
    width:120px;
    height: 30px;
    margin-right: 0;
    .el-checkbox__label{
      span {
        display: block;
        width:100px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}

/* 列头标题 */
.el-table :deep(.caret-wrapper){
  top:5px; right:0; position: absolute;
}
.header-label{ font-size: 14px; }
:deep(.el-date-editor){
  --el-date-editor-daterange-width: auto;
}

/* 列表 */
.pagination {
  margin: 10px auto;
  text-align: center;
}

/* 导出对话框 */
.danger{ color: #f56c6c; line-height: 24px; }

/* 导入对话框 */
.upload-tips{
  div{ margin-top: 10px; }
}
/*.el-dialog {
  margin-top: 5vh !important;
  width: 70vw !important;
}*/
.file-form { display: none; }
.upload-progress{ margin-top: 20px; }
.import-form{ text-align: left; }
.download-tpl-btn{ text-align:right; }



</style>

