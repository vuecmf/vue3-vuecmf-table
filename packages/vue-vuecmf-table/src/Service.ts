// +----------------------------------------------------------------------
// | Copyright (c) 2020~2021 http://www.vuecmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( https://github.com/emei8/vuecmf/blob/master/LICENSE )
// +----------------------------------------------------------------------
// | Author: emei8 <2278667823@qq.com>
// +----------------------------------------------------------------------

import { ref, onMounted, reactive, toRefs } from "vue"
import {ToRefs} from "@vue/reactivity";
import LoadData from "./service/LoadData";
import Download from "./service/Download";
import UploadData from "./service/UploadData";
import {BookType} from "xlsx";
import {getFileExt} from "./Utils";
import {VuecmfTable} from "./typings/VuecmfTable"
import AnyObject = VuecmfTable.AnyObject;

/**
 * table 服务类
 */
export default class Service {

    loadDataService: LoadData;      //加载列表数据服务
    downloadService: Download;      //下载数据服务
    uploadDataService: UploadData;  //导入数据服务
    
    /**
     * 列表设置
     */
    table_config = reactive({
        loading: false,  //加载状态
        api_url: '',     //后端API地址
        page: 'page',    //当前页码的参数名

        //筛选相关
        filter_form: {}, //筛选表单
        keywords: '',    //搜索关键词

        //分页设置
        page_layout: "total, sizes, prev, pager, next, jumper", //分页条展示形式
        current_page: 1, //当前页码数
        page_size: 50,   //每页显示条数

        //表格相关
        columns: [],        //字段信息
        field_options: [],  //字段选项值
        form_info: [],      //表单信息
        form_rules: [],     //表单验证规则
        relation_info: [],  //字段关联信息

        //列数据相关
        table_data: [],         //列表数据
        check_column_list: [],  //列显示
        total: 0,               //总条数
        order_field: "",        //排序字段名
        order_sort: "desc",     //排序方式
        select_rows: {},        //已选择所有行数据
        current_select_row: {}, //当前选择的一行数据
        edit_dlg: false,        //编辑表单对话框
    })
    
    /**
     * 数据导入设置
     */
    import_config = reactive({
        import_dlg: false,          //是否显示导入对话框
        import_data_form: ref(),    //导入表单ref
        import_file_form: ref(),    //file表单ref
        
        import_api_url: '',         //导入后端API地址
        import_file_name: '',       //当前导入文件名
        parse_data_tips: '',        //解析数据时提示
        import_file_error: '',      //导入异常提示语句
        is_import_disabled: true,   //开始按钮是否禁用
        import_percentage: 0,       //导入进度百分比
    })
    
    /**
     * 数据导出设置
     */
    export_config = reactive({
        show_download_dlg: false,   //下载进度提示框的显示与隐藏
        percentage: 0,              //下载进度
        download_error: '',         //下载错误提示
        export_file_name: ''        //导入文件名
    })

    constructor(init_config: AnyObject) {
        console.log('vuecmf-talbe service init')

        this.table_config.page_size = init_config.limit.value
        this.table_config.api_url = init_config.server.value
        this.table_config.page = init_config.page.value
        this.export_config.export_file_name = init_config.export_file_name.value
        this.import_config.import_api_url = init_config.import_server.value

        this.loadDataService = new LoadData(this.table_config, init_config.token.value)
        this.downloadService = new Download(this.export_config, this.loadDataService.pullData)

        this.uploadDataService = new UploadData(
            this.table_config,
            this.import_config,
            this.export_config.export_file_name,
            init_config.token.value
        )

    }
    
    /**
     * 获取配置参数并导出
     * @param config_name 配置名称
     */
    getConfig = (config_name: string): ToRefs => {
        switch (config_name){
            case 'import_config':
                return toRefs(this.import_config)
            case 'export_config':
                return toRefs(this.export_config)
            default:
                return toRefs(this.table_config)
        }
    }
    
    /**
     * 搜索|刷新
     */
    search = ():void => {
        this.table_config.loading = true
        this.import_config.import_dlg = false
        this.loadDataService.reloadPage()
    }
    
    /**
     * 列排序
     * @param column 列头字段信息
     */
    sort = (column: AnyObject):void => {
        this.table_config.order_field = column.prop;
        this.table_config.order_sort = column.order == "descending" ? "desc" : "asc";
        this.search();
    }
    
    /**
     * 格式化字段内容显示
     * @param field_id    字段ID
     * @param field_value 字段值
     */
    formatter = (field_id:number, field_value: string|number): string => {
        if(typeof this.table_config.field_options[field_id] != 'undefined'){
            field_value = this.table_config.field_options[field_id][field_value]
        }else if(typeof this.table_config.form_info[field_id] != 'undefined' && this.table_config.form_info[field_id]['type'] == 'upload'){
            const ext = getFileExt(field_value as string)
            if(['gif','jpg','jpeg','png'].indexOf(ext) != -1){
                field_value = '<img src="' + field_value + '" style="width:60px"  alt="'+ field_value +'"/>';
            }else{
                field_value = '<a href="' + field_value + '" target="_blank">' + field_value + "</a>";
            }
        }else if(typeof field_value == 'string' && field_value.indexOf('http') === 0){
            field_value = '<a href="' + field_value + '" target="_blank">' + field_value + "</a>";
        }

        return field_value as string;
    }
    
    /**
     * 列的显示与隐藏
     * @param check_val 当前选择的列名称
     */
    toggleColumn = (check_val: AnyObject|string|null):void => {
        this.table_config.columns.forEach(function(item:AnyObject) {
            if (
                check_val == "" ||
                check_val == null ||
                check_val.length == 0
            ) {
                item.show = false;
            } else {
                item.show = check_val.indexOf(item.label) != -1;
            }
        })
    }
    
    /**
     * 每页显示条数修改
     * @param size 每页显示的条数
     */
    handleSizeChange = (size:number):void => {
        this.table_config.page_size = size;
        this.search();
    }
    
    /**
     * 当前页修改
     * @param page_num 页码
     */
    handleCurrentChange = (page_num: number):void => {
        this.table_config.current_page = page_num;
        this.search();
    }
    
    /**
     * 导出文件
     * @param type 文件类型
     */
    downloadExport = (type: BookType): void => {
        this.export_config.show_download_dlg = true
        this.export_config.percentage = 0
        this.export_config.download_error = ''
        this.downloadService.exportFile(type, 1, this.table_config.columns, this.table_config.field_options)
    }
    
    /**
     * 下载导入模板文件
     */
    downloadTemplate = ():void => {
        this.uploadDataService.downloadTemplate()
    }
    
    /**
     * 第一步：触发上传
     */
    triggerUpload = ():void => {
        this.uploadDataService.triggerUpload(this.table_config.field_options, this.table_config.form_info)
    }
    
    /**
     * 第二步：解析数据
     * @param fileEvent  选择文件事件对象
     */
    importExcel = (fileEvent: Event):void => {
        this.uploadDataService.importExcel(fileEvent)
    }
    
    /**
     * 第三步：开始导入
     */
    startImportData = ():void => {
        this.uploadDataService.startImportData()
    }
    
    /**
     * 改变窗口大小，分页条自适应
     */
    resizeWin = ():void => {
        //如果页数不够page-count，sizes 将不会显示
        if (document.body.offsetWidth < 768) {
            this.table_config.page_layout = "total, prev, pager, next";
        } else {
            this.table_config.page_layout = "total, sizes, prev, pager, next, jumper";
        }
    }

    /**
     * 获取当前选择的一行数据
     * @param selection  所有选择的行
     * @param row   当前选择的一行
     */
    currentSelect = (selection: AnyObject, row: AnyObject): void => {
        this.table_config.current_select_row = row;
    }

    /**
     * 获取所有已选择的行数据
     * @param selection  所有选择的行
     */
    getSelectRows = (selection: AnyObject): void => {
        this.table_config.select_rows = selection;
    }

    /**
     * 显示行编辑表单
     * @param row
     */
    editRow = (row: AnyObject): void => {
        this.table_config.edit_dlg = true
        this.table_config.current_select_row = row
    }
    
    /**
     * 实例挂载完后，页面显示初始化
     */
    mounted = ():void => {
        onMounted(() => {
            this.loadDataService.loadTableField() //加载列表表头字段
            this.search(); //加载列表数据

            //列表响应式显示处理
            this.resizeWin()
            window.onresize = () => {
                this.resizeWin()
            }

        })
    }




}