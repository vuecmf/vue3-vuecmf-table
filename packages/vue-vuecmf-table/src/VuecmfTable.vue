<template>

  <el-row :gutter="0" >
    <el-col :xs="24" :sm="8" :md="10" :lg="12" :xl="12"  class="btn-group">
      <el-button :size="size" type="primary" @click.prevent="addRow" v-if="add_btn_visible">新增</el-button>
      <slot name="headerAction" :selectRows="select_rows"></slot>
    </el-col>
    <el-col :xs="24" :sm="16" :md="14" :lg="12" :xl="12" class="table-tools">
      <el-row justify="end">
        <el-input :size="size" placeholder="请输入内容" v-model="keywords" @change="search" clearable></el-input>
        <el-button type="default" :size="size" title="刷新" @click="search"><el-icon><icon-refresh /></el-icon></el-button>
        <el-button type="default" :size="size" title="列表显示方式" @click="changeShowType"><el-icon><tickets v-if="data_show_type === 'card'" /><icon-menu v-else /></el-icon></el-button>
        <!--<el-button type="default" size="small" title="日历"><i class="fa fa-calendar"></i></el-button>
        <el-button type="default" size="small" title="透视" @click="pivot"><i class="fa fa-table"></i></el-button>
        <el-button type="default" size="small" title="图表"><i class="fa fa-bar-chart"></i></el-button>-->

        <el-dropdown trigger="click" >
          <el-button type="default" :size="size" title="列">
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

        <el-button type="default" :size="size"  title="导入" @click="import_dlg = true" v-if="import_server != ''"><el-icon><upload /></el-icon></el-button>

        <el-dropdown trigger="click" @command="downloadExport">
          <el-button type="default" :size="size" title="导出">
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

  <template v-if="data_show_type === 'card'">
    <el-row :gutter="10">
      <template :key="index" v-for="(item,index) in table_data">
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="3" style="padding: 5px">
          <el-card  :body-style="{ padding: '10px'}" shadow="hover">
            <template :key="idx" v-for="(field,idx) in columns">
              <div v-if="field.show">
                {{ field.label }} :
                <span v-html="formatter(field.field_id, item[field.prop])"></span>
              </div>
            </template>
            <div class="card-btn">
              <el-button :size="size" type="primary" @click.prevent="detailRow(item)" v-if="detail_btn_visible(item)">详情</el-button>
              <el-button :size="size" type="success" @click.prevent="editRow(item)" v-if="edit_btn_visible(item)">编辑</el-button>
              <el-button :size="size" type="danger" @click.prevent="delRow(item)" v-if="del_btn_visible(item)">删除</el-button>
              <slot name="rowAction" :row="item" :index="index" :service="service"></slot>
            </div>
          </el-card>
        </el-col>
      </template>
    </el-row>
  </template>
  <template v-else>
    <el-table
        ref="vuecmf_table_ref"
        :data="table_data"
        border
        style="width: 100%"
        :size="size"
        :stripe="true"
        :height="height"
        @select="currentSelect"
        @selection-change="getSelectRows"
        :row-key="row_key"
        :default-expand-all="default_expand_all"

    >
      <!-- 行选择 -->
      <el-table-column fixed type="selection" :selectable="selectable" width="50" v-if="checkbox"></el-table-column>

      <!-- 列头及列表展示 -->
      <template v-for="(item,index) in columns">
        <el-table-column v-if="item.show"
                         :prop="item.prop"
                         :label="item.label"
                         :sortable="false"
                         :fixed= "item.fixed"
                         :min-width="item.width"
                         :key="index"
                         :class-name="item.sort"
        >
          <!-- 列头自定义 -->
          <template #header>
            <span class="header-label">{{ item.label }}</span>
            <el-tooltip v-if="item.tooltip" placement="bottom" effect="dark">
              <el-icon size="15"><question-filled /></el-icon>
              <template #content >
                <div><span v-html="item.tooltip"></span></div>
              </template>
            </el-tooltip>
            <div>
              <template v-if="item.filter">
                <el-select v-model="filter_form[item.prop]" @change="search" multiple collapse-tags placeholder="请选择" v-if=" typeof field_options[item.field_id] == 'object'" :size="size">
                  <el-option
                      v-for="(option_val,option_key) in field_options[item.field_id]"
                      :key="option_key"
                      :label="option_val.label"
                      :value="option_val.value"
                  >
                  </el-option>
                </el-select>
                <el-select v-model="filter_form[item.prop]" @change="search"  multiple collapse-tags placeholder="请选择" v-else-if=" typeof relation_info.options == 'object' && typeof relation_info.options[item.field_id] == 'object'" :size="size">
                  <el-option
                      v-for="(option_val,option_key) in relation_info.full_options[item.field_id]"
                      :key="option_key"
                      :label="option_val.label"
                      :value="option_val.value"
                  >
                  </el-option>
                </el-select>
                <el-date-picker @change="search" :size="size" :format="date_format" :value-format="date_value_format" v-model="filter_form[item.prop]" type="daterange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" v-else-if=" typeof form_info[item.field_id] != 'undefined' && (form_info[item.field_id].type == 'date' || form_info[item.field_id].type == 'datetime')">
                </el-date-picker>
                <el-input
                    @change="search"
                    v-model="filter_form[item.prop]"
                    :size="size"  clearable
                    placeholder="输入关键字搜索" v-else />
              </template>
            </div>

            <span class="caret-wrapper" @click="sort(item)"><i class="sort-caret ascending"></i><i class="sort-caret descending"></i></span>

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
      <el-table-column fixed="right" label="操作" :min-width="operate_width" v-if="operate_width > 0">
        <template #default="scope" >

          <template v-if="expand_action">
            <el-button :size="size" type="primary" @click.prevent="detailRow(scope.row)" v-if="detail_btn_visible(scope.row)">详情</el-button>
            <el-button :size="size" type="success" @click.prevent="editRow(scope.row)" v-if="edit_btn_visible(scope.row)">编辑</el-button>
            <el-button :size="size" type="danger" @click.prevent="delRow(scope.row)" v-if="del_btn_visible(scope.row)">删除</el-button>

            <slot name="rowAction" :row="scope.row" :index="scope.$index" :service="service"></slot>

          </template>
          <template v-else>
            <el-menu mode="horizontal">
              <el-menu-item @click="detailRow(scope.row)" v-if="detail_btn_visible(scope.row)">详情</el-menu-item>
              <el-menu-item @click="editRow(scope.row)" v-if="edit_btn_visible(scope.row)">编辑</el-menu-item>
              <el-menu-item @click="delRow(scope.row)" v-if="del_btn_visible(scope.row)">删除</el-menu-item>
              <slot name="rowAction" :row="scope.row" :index="scope.$index" :service="service"></slot>
            </el-menu>
          </template>

        </template>

      </el-table-column>

      <!-- 行展开 -->
      <el-table-column type="expand" fixed="left" v-if="expand">
        <template #default="props">
          <!-- 表格行展开自定义 -->
          <slot name="rowExpand" :row="props.row" :index="props.$index">
            <template v-if="props.row.expand_data != undefined && props.row.expand_data.table_list != undefined">
              <el-table border :data="props.row.expand_data.table_list" :size="size" :stripe="true" >

                <el-table-column :prop="item.prop" :label="item.label" :width="item.width" :key="index" v-for="(item,index) in props.row.expand_data.table_fields">
                  <template #default="expand_scope">
                    <span  v-html="expand_scope.row[item.prop]"></span>
                  </template>
                </el-table-column>

              </el-table>
            </template>
          </slot>

        </template>
      </el-table-column>

    </el-table>
  </template>


  <div class="pagination" v-if=" typeof row_key == 'undefined' || row_key === '' || row_key == null">
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
  <vuecmf-dialog
      title="正在下载数据，请稍后..."
      :model_value="show_download_dlg"
      :width="form_dialog_width"
      :close_on_click_modal="false"
      :close_on_press_escape="false"
      :show_close="false"
      @updateVisible="showDownloadDlg"
  >
    <template #content>
      <span class="danger">{{ download_error }}</span>
      <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage"></el-progress>
    </template>
  </vuecmf-dialog>

  <!-- 导入数据 -->
  <vuecmf-dialog :model_value="import_dlg" title="导入" :width="form_dialog_width" custom_class="import-dlg" @close="search" @updateVisible="showImportDlg">
    <template #content>
      <el-row justify="space-between">
        <el-col :span="12" class="import-form">
          <form ref="import_data_form">
            <input type="file" ref="import_file_form" class="file-form" @change="importExcel"  accept=".xlsx, .xls">
            <el-button  type="primary" @click="triggerUpload" :size="size">选择文件</el-button>
          </form>
        </el-col>

        <el-col :span="12" class="download-tpl-btn">
          <el-button  type="success"  @click="downloadTemplate" :size="size">下载模板</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col v-if=" import_file_name !== '' " class="upload-tips">
          <div>当前选择文件:  {{ import_file_name }}</div>
          <div v-html="parse_data_tips"></div>
          <div v-if=" import_file_error !== '' ">
            <div class="danger" v-html="import_file_error"></div>
          </div>
        </el-col>
        <el-col class="upload-progress">
          <el-progress  :text-inside="true"  status="success"  :stroke-width="18" :percentage="import_percentage"></el-progress>
        </el-col>
      </el-row>
    </template>
    <template #footer>
      <el-button type="default" :size="size"  @click=" import_dlg = false ">关闭</el-button>
      <el-button type="primary" :size="size"  @click="startImportData" :disabled=" is_import_disabled ">开始</el-button>
    </template>
  </vuecmf-dialog>

  <!-- 编辑表单 -->
  <vuecmf-dialog :model_value="edit_dlg" :title="form_title" :width="form_dialog_width"  @close="search" @updateVisible="showEditDlg">
    <template #content>
      <el-form :inline="false" ref="edit_form_ref" status-icon :rules="form_rules" :label-width="form_label_width + 'px'" :size="size" :model="current_select_row" class="edit-form-inline">
        <template :key="index" v-for="(item, index) in form_info">
          <el-form-item  :label="item.label" v-if="item.type === 'date'" :prop="item.field_name">
            <el-date-picker v-model="current_select_row[item.field_name]" :format="date_format" :value-format="date_value_format" type="date" placeholder="请选择日期" :disabled="item.is_disabled" clearable >
            </el-date-picker>
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'datetime'" :prop="item.field_name">
            <el-date-picker v-model="current_select_row[item.field_name]" :format="datetime_format" :value-format="datetime_value_format" type="datetime" placeholder="请选择日期时间"  :disabled="item.is_disabled" clearable >
            </el-date-picker>
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'input_number'" :prop="item.field_name">
            <el-input-number v-model="current_select_row[item.field_name]"  :disabled="item.is_disabled" />
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'hidden'" :prop="item.field_name" style="display: none">
            <input type="hidden" v-model="current_select_row[item.field_name]" />
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'textarea'" :prop="item.field_name">
            <el-input v-model="current_select_row[item.field_name]" :rows="3" placeholder="请输入内容" type="textarea"  :disabled="item.is_disabled" />
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'switch'" :prop="item.field_name">
            <el-switch v-model="current_select_row[item.field_name]" active-value="10" inactive-value="20"  :disabled="item.is_disabled" />
          </el-form-item>
          <el-form-item :label="item.label" v-else-if=" ['radio','checkbox','select','select_mul'].indexOf(item.type) !== -1 " :prop="item.field_name">
            <template v-if=" typeof field_options[item.field_id] != 'undefined' ">
              <template v-if="item.type === 'radio'">
                <el-radio-group v-model="current_select_row[item.field_name]"  :disabled="item.is_disabled">
                  <el-radio :label="op_val.value" :key="op_idx" v-for="(op_val,op_idx) in field_options[item.field_id]">{{ op_val.label }}</el-radio>
                </el-radio-group>
              </template>
              <template v-else-if="item.type === 'checkbox'">
                <el-checkbox-group v-model="current_select_row[item.field_name]"  :disabled="item.is_disabled">
                  <el-checkbox :label="op_val.value" :key="op_idx" v-for="(op_val,op_idx) in field_options[item.field_id]">{{ op_val.label }}</el-checkbox>
                </el-checkbox-group>
              </template>
              <template v-else>
                <el-select :teleported="false" v-model="current_select_row[item.field_name]" filterable :multiple="item.type === 'select_mul'" placeholder="请选择"  :disabled="item.is_disabled" clearable @change="((sel_val) => { if(typeof relation_info.linkage == 'object' && typeof relation_info.linkage[item.field_id] == 'object') changeEvent(item.field_name, sel_val) })">
                  <el-option :label="op_val.label" :value="op_val.value" :key="op_idx" v-for="(op_val,op_idx) in field_options[item.field_id]"></el-option>
                </el-select>
              </template>
            </template>

            <template v-else-if=" typeof relation_info.options == 'object' && typeof relation_info.options[item.field_id] != 'undefined' ">
              <template v-if="item.type === 'radio'">
                <el-radio-group  :disabled="item.is_disabled" v-model="current_select_row[item.field_name]" @change="((sel_val) => { if(typeof relation_info.linkage == 'object' && typeof relation_info.linkage[item.field_id] == 'object') changeEvent(item.field_name, sel_val) })">
                  <el-radio :label=" op_val.value " :key="op_idx" v-for="(op_val,op_idx) in relation_info.options[item.field_id]">{{ op_val.label }}</el-radio>
                </el-radio-group>
              </template>
              <template v-else-if="item.type === 'checkbox'">
                <el-checkbox-group  :disabled="item.is_disabled" v-model="current_select_row[item.field_name]" @change="((sel_val) => { if(typeof relation_info.linkage == 'object' && typeof relation_info.linkage[item.field_id] == 'object') changeEvent(item.field_name, sel_val) })">
                  <el-checkbox :label=" op_val.value " :key="op_idx" v-for="(op_val,op_idx) in relation_info.options[item.field_id]">{{ op_val.label }}</el-checkbox>
                </el-checkbox-group>
              </template>
              <template v-else>
                <el-select  :disabled="item.is_disabled" :teleported="false" v-model="current_select_row[item.field_name]" filterable :multiple="item.type === 'select_mul'" placeholder="请选择" clearable  @change="((sel_val) => { if(typeof relation_info.linkage == 'object' && typeof relation_info.linkage[item.field_id] == 'object') changeEvent(item.field_name, sel_val) })">
                  <el-option :label=" op_val.label " :value=" op_val.value " :key="op_idx" v-for="(op_val,op_idx) in relation_info.options[item.field_id]"></el-option>
                </el-select>
              </template>
            </template>

            <template v-else>
              没有获取到相关内容
            </template>
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'upload_image' || item.type === 'upload_file'" :prop="item.field_name">
            <el-upload
                :disabled="item.is_disabled"
                :ref="(el: Ref) => setUploadRef(el, item.field_name)"
                :headers="{token:token}"
                :data="{field_name:item.field_name}"
                :action="upload_api_url"
                :on-preview="previewFile"
                :on-success="uploadSuccess"
                :on-remove="fileRemove"
                :list-type=" item.type === 'upload_image' ? 'picture-card' : 'text' "
                :accept=" item.type === 'upload_image' ? 'image/*' : '' "
                multiple
                :file-list="current_select_row[item.field_name]"
            >
              <el-icon v-if="item.type === 'upload_image'"><Plus /></el-icon>
              <el-button :size="size" type="primary" v-else>上传</el-button>

            </el-upload>
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'editor'" :prop="item.field_name">
            <vuecmf-editor
                :id="item.field_name"
                :content="current_select_row[item.field_name]"
                @on-change="getEditorContent"
                :token="token"
                :params="{field_name:item.field_name}"
                :upload="upload_api_url"
                :size="size"
            ></vuecmf-editor>
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'password'" :prop="item.field_name">
            <el-input  :disabled="item.is_disabled" v-model="current_select_row[item.field_name]" type="password" autocomplete="off" clearable ></el-input>
          </el-form-item>
          <el-form-item :label="item.label" :prop="item.field_name" v-else>
            <el-input  :disabled="item.is_disabled" v-model="current_select_row[item.field_name]" :placeholder="item.default_value" clearable ></el-input>
          </el-form-item>
        </template>

      </el-form>
    </template>
    <template #footer>
      <el-button type="default" :size="size"  @click="edit_dlg = false">取消</el-button>
      <el-button type="primary" :size="size"  @click="saveEditRow">保存</el-button>
    </template>
  </vuecmf-dialog>

  <!-- 行详情 -->
  <vuecmf-dialog :model_value="detail_dlg" :width="form_dialog_width" title="详情" @updateVisible="showDetailDlg">
    <template #content>
      <table>
        <tr :key="index" v-for=" (item, index) in columns ">
          <th align="right">{{ item.label }}:</th>
          <td>
            <div v-html="formatter(item.field_id, detail_data[item.prop])"></div>
          </td>
        </tr>
      </table>
    </template>
    <template #footer>
      <div style="text-align: center"><el-button type="default" :size="size"  @click="detail_dlg = false">关闭</el-button></div>
    </template>
  </vuecmf-dialog>

</template>

<script lang="ts" setup>
import Service from './Service'
import {toRefs, defineProps, defineEmits} from "vue"
import {VuecmfTable} from "./typings/VuecmfTable";
import AnyObject = VuecmfTable.AnyObject;


//异常错误提示回调处理函数
const emit = defineEmits(['exception', 'beforeLoadTable', 'afterLoadTable'])

const props = defineProps({
  //加载列表数据的后端API链接
  server: {
    type: String,
    default: ''
  },
  //文件上传后端API地址
  upload_server: {
    type: String,
    default: ''
  },
  //保存单条数据
  save_server: {
    type: String,
    default: ''
  },
  //导入数据的后端API链接
  import_server: {
    type: String,
    default: ''
  },
  //删除行数据的后端API链接
  del_server: {
    type: String,
    default: ''
  },
  //后端需要的token信息
  token: {
    type: String,
    default: ''
  },
  //当前页码的参数名
  page: {
    type: String,
    default: 'page'
  },
  //每页显示条数
  limit: {
    type: Number,
    default: 20,
  },

  //列表表格高度
  height: {
    type: String,
    default: '300px'
  },
  //列表中的按钮及表单样式大小 large, default, small
  size: {
    type: String,
    default: 'default',
    validator: function (value:string) {
      return ['default', 'large', 'small'].indexOf(value) !== -1
    }
  },
  //操作列的宽度
  operate_width: {
    type: Number,
    default: 0
  },
  //是否显示行详情按钮
  detail_btn_visible: {
    type: Function,
    default: (select_row: AnyObject) => false
  },
  //是否显示新增按钮
  add_btn_visible: {
    type: Boolean,
    default: false
  },
  //是否显示行编辑按钮
  edit_btn_visible: {
    type: Function,
    default: (select_row: AnyObject) => false
  },
  //是否显示行删除按钮
  del_btn_visible:{
    type: Function,
    default: (select_row: AnyObject) => false
  },
  //是否显示行选择复选框
  checkbox: {
    type: Boolean,
    default: false
  },
  //是否显示行展开功能
  expand: {
    type: Boolean,
    default: false
  },
  //行是否可选回调函数
  selectable: {
    type: Function,
    default: () => true
  },
  //表单加载前的回调函数
  load_form:{
    type: Function,
    default: (tableService: AnyObject, select_row: AnyObject) => Promise.resolve(true)
  },

  //树形数据唯一键字段，列表数据为树形时（即包含 children 字段时）此项必须设置
  row_key: {
    type: String,
    default: ''
  },
  //列表数据为树形时（即包含 children 字段时）是否全部展开
  default_expand_all: {
    type: Boolean,
    default: true
  },

  //导出的文件名称
  export_file_name: {
    type: String,
    default: (new Date()).valueOf().toString()
  },

  //是否展开行操作
  expand_action: {
    type: Boolean,
    default: true
  },

  //表单弹窗宽度
  form_dialog_width: {
    type: String,
    default: '50%'
  },

  //日期控件显示格式, 如 2023-02-18
  date_format: {
    type: String,
    default: 'YYYY-MM-DD'
  },

  //日期控件保存的值格式, 如 2023-02-18
  date_value_format: {
    type: String,
    default: 'YYYY-MM-DD'
  },

  //日期时间控件显示格式, 如 2023-02-18 15:24:32
  datetime_format: {
    type: String,
    default: 'YYYY-MM-DD HH:mm:ss'
  },

  //日期时间控件保存的值格式, 如 2023-02-18 15:24:32
  datetime_value_format: {
    type: String,
    default: 'YYYY-MM-DD HH:mm:ss'
  },

  //列表展示方式
  show_type: {
    type: String,
    default: 'table'  //table, card
  }

})

//获取父组件传入的信息
const {limit, server, page, token, export_file_name, import_server, save_server, del_server, upload_server, load_form, row_key,show_type } = toRefs(props)

//实例化服务类
const service = new Service({
  limit: limit,
  server: server,
  page: page,
  token: token,
  export_file_name: export_file_name,
  import_server: import_server,
  save_server: save_server,
  del_server: del_server,
  upload_server: upload_server,
  load_form: load_form,
  row_key: row_key
},emit)


//获取配置信息
const {
  check_column_list,  //列显示
  detail_dlg,         //是否显示详情窗口
  detail_data,        //详情内容

  vuecmf_table_ref,   //table ref
  filter_form,        //筛选表单
  keywords,           // 关键字搜索
  field_options,      //字段选项信息
  form_info,          //字段表单信息
  relation_info,      //字段关联信息
  form_rules,         //表单验证配置
  form_label_width,   //表单标签名称宽度

  //分页设置
  page_layout,        //分页显示格式
  current_page,       //当前页码
  page_size,          //每页显示条数
  total,              //列表总记录数

  //列数据相关
  table_data,         //列表数据
  columns,            //列头字段信息
  select_rows,        //已选择的所有行数据
  current_select_row, //当前选择的一行数据
  data_show_type,     //列表展示方式


} = service.getConfig('table_config')

const {
  form_title,         //表单标题
  edit_form_ref,      //编辑表单ref
  edit_dlg,           //编辑表单对话框
  import_dlg,         //是否显示导入对话框
  import_data_form,   //导入表单ref
  import_file_form,   //file表单ref
  parse_data_tips,    //解析数据时提示
  import_file_name,   //当前导入文件名
  import_file_error,  //导入异常提示语句
  is_import_disabled, //开始按钮是否禁用
  import_percentage,  //导入进度百分比
  upload_api_url,     //上传文件API

  changeEvent,        //表单中的组件change事件回调函数

} = service.getConfig('import_config')

const {
  show_download_dlg, //下载进度提示框的显示与隐藏
  percentage,        //下载进度
  download_error,    //下载错误提示
} = service.getConfig('export_config')


data_show_type.value = show_type?.value


//事件方法
const search = service.search                           //搜索
const toggleColumn = service.toggleColumn               //显示或隐藏列
const sort = service.sort                               //排序
const handleSizeChange = service.handleSizeChange       //修改每页显示条数
const handleCurrentChange = service.handleCurrentChange //切换当前页码
const formatter = service.formatter                     //格式化字段显示

const downloadExport = service.downloadExport           //导出文件

const downloadTemplate = service.downloadTemplate       //下载导入模板文件
const triggerUpload = service.triggerUpload             //触发上传
const importExcel = service.importExcel                 //读取文件并解析数据
const startImportData = service.startImportData         //开始上传

const currentSelect = service.currentSelect             //当前选择行事件
const getSelectRows = service.getSelectRows             //获取所有选择的数据
const detailRow = service.detailRow                     //显示行详情内容

const addRow = service.addRow                           //添加一行数据
const editRow = service.editRow                         //显示行编辑表单
const delRow = service.delRow                           //删除行数据
const saveEditRow = service.saveEditRow                 //保存行编辑数据
const previewFile = service.previewFile                 //预览文件
const uploadSuccess = service.uploadSuccess             //上传文件成功
const fileRemove = service.fileRemove                   //文件移除
const getEditorContent = service.getEditorContent       //获取编辑器内容
const setUploadRef = service.setUploadRef               //设置文件上传ref
const changeShowType = service.changeShowType           //改变列表展示方式

const showDownloadDlg = () => show_download_dlg.value = false
const showImportDlg = () => import_dlg.value = false
const showEditDlg = () => edit_dlg.value = false
const showDetailDlg = () => detail_dlg.value = false


service.mounted()


</script>

<script lang="ts" >
import { defineComponent } from 'vue'

//引入element-plus图标
import {
  Download,
  Upload,
  Grid,
  Refresh as IconRefresh,
  QuestionFilled,
  ArrowDown,
  Plus,
  Tickets,
  Menu as IconMenu
} from '@element-plus/icons-vue'

import { ElCard,ElMenu,ElMenuItem } from 'element-plus'


export default defineComponent({
  name: 'vuecmf-table',
  components: {
    ElCard,ElMenu,ElMenuItem, Download, Upload, Grid, IconRefresh, QuestionFilled, ArrowDown, Plus, Tickets, IconMenu
  }
});
</script>

<style lang="scss" scoped>
/* 列表左边工具栏 */
.btn-group, .table-tools{
  margin-bottom: 10px;
}
.btn-group {
  text-align: left; padding-top: 3px;
}
/* 列表右边工具栏 */
.table-tools {
  text-align: right;

  .el-input--small, .el-input--default, .el-input--large{
    width: calc(100% - 166px);
    :deep(.el-input__inner) {
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
  }

  .el-button--default{
    padding: 9px;
  }

  .el-button--small{
    padding: 4px;
  }

  .el-button--large{
    padding: 12px;
  }

  .el-button {
    margin-left: -1px !important;
    border-radius: 0px;
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
  padding-top: 8px;
  padding-left: 3px;
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
  top:8px; right:0; position: absolute;
}


.header-label{ font-size: 14px; }
:deep(.el-date-editor){
  --el-date-editor-daterange-width: auto;
}

/* 列表 */
.pagination {
  display: flex;
  justify-content: center;
  margin: 10px auto;
}

/* 导出对话框 */
.danger{ color: #f56c6c; line-height: 24px; }

/* 导入对话框 */
.upload-tips{
  div{ margin-top: 10px; }
}
.file-form { display: none; }
.upload-progress{ margin-top: 20px; }
.import-form{ text-align: left; }
.download-tpl-btn{ text-align:right; }

/* 上传文件 */
:deep(.el-upload-list__item-name) {
  white-space: normal;
}

</style>

<style lang="scss">
.cell{
  .el-button{ margin: 3px !important;}
}
.el-message-box__btns{
  justify-content: center;
}

.el-input-number {
  .el-input__wrapper{
    display: inline-flex !important;
  }
}

.el-table th.el-table__cell{
  padding: 4px 0 8px !important;
}

.card-btn .el-button{
  margin-top: 8px;
}

</style>
