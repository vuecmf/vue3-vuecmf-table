// +----------------------------------------------------------------------
// | Copyright (c) 2020~2022 http://www.vuecmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( https://github.com/emei8/vuecmf/blob/master/LICENSE )
// +----------------------------------------------------------------------
// | Author: emei8 <2278667823@qq.com>
// +----------------------------------------------------------------------

import {ref, onMounted, reactive, toRefs, toRaw, Ref, ToRefs} from "vue"
import LoadData from "./service/LoadData";
import Download from "./service/Download";
import UploadData from "./service/UploadData";
import {BookType} from "xlsx";
import {getFileExt} from "./Utils";
import {VuecmfTable} from "./typings/VuecmfTable"
import AnyObject = VuecmfTable.AnyObject;
import {ElMessage, ElMessageBox} from "element-plus";

/**
 * table 服务类
 */
export default class Service {

    loadDataService: LoadData;      //加载列表数据服务
    downloadService: Download;      //下载数据服务
    uploadDataService: UploadData;  //导入数据服务

    uploadRefs: AnyObject = {}

    /**
     * 列表设置
     */
    table_config = reactive({
        loadingService: {}, //加载状态服务
        api_url: '',        //后端API地址
        page: 'page',       //当前页码的参数名
        detail_dlg: false,  //是否显示详情窗口
        detail_data: {},    //详情内容
        del_api_url: '',    //删除行数据API地址

        //筛选相关
        field_filter: {},   //拉取字段信息的筛选表单
        filter_form: {},    //列表筛选表单
        extend_params: {},  //扩展筛选参数，与data参数并列关系
        keywords: '',       //列表搜索关键词

        //分页设置
        page_layout: "total, sizes, prev, pager, next, jumper", //分页条展示形式
        current_page: 1, //当前页码数
        page_size: 50,   //每页显示条数

        //表格相关
        vuecmf_table_ref: ref(), //table ref
        columns: [],             //字段信息
        field_options: [],       //字段选项值
        form_info: [],           //表单信息
        form_rules: [],          //表单验证规则
        relation_info: [],       //字段关联信息
        form_label_width: 80,    //表单标签名称宽度

        //列数据相关
        table_data: [],         //列表数据
        check_column_list: [],  //列显示
        total: 0,               //总条数
        order_field: "",        //排序字段名
        order_sort: "desc",     //排序方式
        select_rows: {},        //已选择所有行数据
        current_select_row: ref<AnyObject>(), //当前选择的一行数据
        data_show_type: 'table',   //列表展示方式: table  | card

    })

    /**
     * 数据导入设置
     */
    import_config = reactive({
        save_data_type: 'new',      //保存数据类型 new(新增), edit(编辑)
        form_title: '编辑',          //表单标题
        edit_form_ref: ref(),       //编辑表单ref
        edit_dlg: false,            //编辑表单对话框

        import_dlg: false,          //是否显示导入对话框
        import_data_form: ref(),    //导入表单ref
        import_file_form: ref(),    //file表单ref

        //表单加载前的回调函数
        loadForm: (tableService: AnyObject, select_row: AnyObject):boolean => {
            console.log(tableService,select_row)
            return true
        },

        changeEvent: () => null,    //表单中的组件change事件回调函数

        import_api_url: '',         //导入后端API地址
        save_api_url: '',           //保存数据API地址
        upload_api_url: '',         //上传文件API地址
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
        export_file_name: '',       //导入文件名
        row_key: ''                 //目录树ID字段设置（方便目录树类型的列表数据导出）
    })

    constructor(init_config: AnyObject, emit:EmitFn<EE[]>) {
        console.log('vuecmf-talbe service init')

        this.table_config.page_size = init_config.limit.value
        this.table_config.api_url = init_config.server.value
        this.table_config.del_api_url = init_config.del_server.value
        this.table_config.page = init_config.page.value
        this.export_config.export_file_name = init_config.export_file_name.value
        this.export_config.row_key = init_config.row_key.value
        this.import_config.import_api_url = init_config.import_server.value
        this.import_config.save_api_url = init_config.save_server.value
        this.import_config.loadForm = init_config.load_form.value
        this.import_config.upload_api_url = init_config.upload_server.value

        this.loadDataService = new LoadData(this.table_config, init_config.token.value, emit)
        this.downloadService = new Download(this.export_config, this.loadDataService.pullData)

        this.uploadDataService = new UploadData(
            this.table_config,
            this.import_config,
            this.export_config.export_file_name,
            init_config.token.value
        )

        //表格数据加载前回调处理，传入服务类实例 , 作用是将 表格组件中的服务类实例暴露出来，便于操作表格数据，如过滤表单设置
        emit('beforeLoadTable', this)

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
        this.import_config.import_dlg = false
        this.loadDataService.reloadPage()
    }

    /**
     * 列排序
     * @param column 列头字段信息
     */
    sort = (column: AnyObject):void => {
        this.table_config.order_field = column.prop;
        if(column.sort == ''){
            column.sort = 'ascending'
        }else if(column.sort == 'ascending'){
            column.sort = 'descending'
        }else{
            column.sort = ''
        }

        if(column.sort != ''){
            this.table_config.order_sort = column.sort == "descending" ? "desc" : "asc";
        }else{
            this.table_config.order_field = '';
            this.table_config.order_sort = ''
        }

        this.search();
    }

    /**
     * 格式化文件显示
     * @param name  文件名
     * @param url  文件链接
     */
    private formatFile = (name: string, url: string):string => {
        if(url === undefined || url === '') return ''
        const arr = url.split(',')
        const res: string[] = []
        arr.forEach((file_url) => {
            const ext = getFileExt(file_url)
            if(['gif','jpg','jpeg','png'].indexOf(ext) != -1){
                res.push('<a href="' + file_url + '" target="_blank"><img src="' + file_url + '" style="width:100px; margin-bottom: 6px;"  alt="'+ name +'"/></a>');
            }else{
                res.push('<a href="' + file_url + '" target="_blank" style="margin-bottom: 6px;">' + name + "</a>");
            }
        })
        return res.join('<br>')
    }

    /**
     * 格式化字段内容显示
     * @param field_id    字段ID
     * @param field_value 字段值
     */
    formatter = (field_id:number, field_value: string|number|AnyObject): string|AnyObject => {
        let result:string|AnyObject = ''
        if(this.table_config.field_options != null && typeof this.table_config.field_options[field_id] != 'undefined'){
            //字段选项类型处理
            if(typeof field_value == 'string'){
                const id_arr = field_value.split(',')
                const rs: never[] = []
                id_arr.forEach((id) => {
                    const options = this.table_config.field_options[field_id]
                    if(options != undefined) {
                        Object.keys(options).forEach((key) => {
                            if (options[key]['value'] == id) rs.push(options[key]['label'])
                        })
                    }
                })
                result = rs.join('<br>')
            }else if(typeof field_value == 'number'){
                const options: AnyObject = this.table_config.field_options[field_id]
                if(options != undefined){
                    Object.keys(options).forEach((key) => {
                        if(options[key]['value'] == field_value) result = options[key]['label']
                    })
                }
            }else{
                result = field_value
            }
            if(typeof result === 'string') result = result.replace(/[┊┊┈└─]/g,'').trim()

        }else if(this.table_config.relation_info != null && typeof this.table_config.relation_info.full_options == 'object' &&
            typeof this.table_config.relation_info.full_options[field_id] != 'undefined'){
            //关联字段类型处理
            if(typeof field_value == 'string'){
                const id_arr = field_value.split(',')
                const rs: string|number[] = []
                id_arr.forEach((id) => {
                    const full_options: AnyObject = this.table_config.relation_info.full_options[field_id]
                    if(full_options != null) {
                        Object.keys(full_options).forEach((key) => {
                            if (full_options[key]['value'] == id) rs.push(full_options[key]['label'])
                        })
                    }
                })
                result = rs.join('<br>')
            }else if(typeof field_value == 'number'){
                const full_options: AnyObject = this.table_config.relation_info.full_options[field_id]
                if(full_options != null){
                    Object.keys(full_options).forEach((key) => {
                        if(full_options[key]['value'] == field_value) result = full_options[key]['label']
                    })
                }else{
                    result = '0'
                }

            }else{
                result = field_value
            }

            if(typeof result === 'string') result = result.replace(/[┊┊┈└─]/g,'').trim()

        }else{
            //获取字段对应表单信息
            let flag = true
            if(this.table_config.form_info != null){
                Object.values(this.table_config.form_info).forEach((field_info: AnyObject) => {
                    if(field_info.field_id == field_id && (field_info.type == 'upload_image' || field_info.type == 'upload_file')){
                        flag = false
                        //字段内容是文件类型的处理
                        if(typeof field_value == 'object'){
                            field_value.forEach((item:AnyObject)=>{
                                result += this.formatFile(item.name, item.url)
                            })
                        }else{
                            result += this.formatFile(field_value as string, field_value as string)
                        }
                    }
                })
            }

            //其他类型字段处理
            if(flag){
                if(typeof field_value == 'string' && field_value.indexOf('http') === 0){
                    //字段内容是链接地址的处理
                    result = '<a href="' + field_value + '" target="_blank">' + field_value + "</a>";
                }else{
                    result = field_value as string
                }
            }

        }

        return result;
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
        this.downloadService.exportFile(type, 1, this.table_config.columns, this.table_config.field_options, this.table_config.relation_info)
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
        this.uploadDataService.triggerUpload(this.table_config.field_options, this.table_config.form_info, this.table_config.relation_info)
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
        setTimeout(() => this.loadDataService.loadTableField(), 300) //加载列表表头字段
    }

    /**
     * 改变窗口大小，分页条自适应
     */
    resizeWin = ():void => {
        //如果页数不够page-count，sizes 将不会显示
        if(this.table_config.vuecmf_table_ref != null && this.table_config.vuecmf_table_ref.$el != null){
            if (this.table_config.vuecmf_table_ref.$el.offsetWidth < 768) {
                this.table_config.page_layout = "total, prev, pager, next";
            } else {
                this.table_config.page_layout = "total, sizes, prev, pager, next, jumper";
            }
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
     * 显示行详情
     * @param row
     */
    detailRow = (row: AnyObject): void => {
        this.table_config.detail_data = row
        this.table_config.detail_dlg = true
    }


    /**
     * 重置FORM表单，清除历史验证等信息
     */
    private resetForm = ():void => {
        if(typeof this.import_config.edit_form_ref != 'undefined' && this.import_config.edit_form_ref != null){
            this.import_config.edit_form_ref.resetFields()
            Object.values(this.uploadRefs).forEach((upload_ref) => {
                upload_ref.clearFiles()
            })
        }
    }

    /**
     * 显示新增表单
     */
    addRow = (): void => {
        this.import_config.save_data_type = 'new'
        this.resetForm()

        const row:AnyObject = {}
        Object.values(this.table_config.form_info).forEach((item)=>{
            //默认值设置
            Object.values(this.table_config.columns).forEach((fieldInfo) => {
                if(fieldInfo['field_id'] == item['field_id']){
                    if(item['type'] == 'upload_image' || item['type'] == 'upload_file'){
                        row[item['field_name']] = []
                    }else if(['bigint','int','smallint','tinyint'].indexOf(fieldInfo['type']) != -1){
                        row[item['field_name']] = item['default_value'] == '0' || item['default_value'] == '' ? null : parseInt(item['default_value'])
                    }else if(['decimal','double','float'].indexOf(fieldInfo['type']) != -1){
                        row[item['field_name']] = item['default_value'] == '0' || item['default_value'] == '' ? null : parseFloat(item['default_value'])
                    }else if(item['type'] == "checkbox" || item['type'] == "select_mul") {
                        if(item['default_value'] == ""){
                            row[item['field_name']] = []
                        }else{
                            row[item['field_name']] = item['default_value'].split(',')
                        }

                    }else{
                        row[item['field_name']] = item['default_value']
                    }
                }
            })

        })

        this.table_config.current_select_row = row
        this.import_config.form_title = '新增'
        this.import_config.edit_dlg = true

        //表单加载完的回调
        this.import_config.loadForm(this, row)

    }


    /**
     * 显示行编辑表单
     * @param row
     */
    editRow = (row: AnyObject): void => {
        this.import_config.save_data_type = 'edit'
        this.resetForm()

        //将上传控件的 字符串值转换成 数组列表
        Object.keys(row).forEach((key)=>{
            Object.values(this.table_config.form_info).forEach((item)=>{
                //默认值类型转换成与字段类型一致
                if(key == item['field_name'] && item['type'] == 'password'){
                    row[key] = ''
                }else if(key == item['field_name'] && item['type'] == 'select'){
                    row[key] = row[key] == 0 ? null : row[key]
                }else if(key == item['field_name'] && (item['type'] == 'select_mul' || item['type'] == 'checkbox') ){
                    if(row[key] == ''){
                        row[key] = []
                    }else{
                        const arr = row[key].split(',')
                        arr.forEach((v:string, k:number) => {
                            if(item['type'] == 'checkbox'){
                                arr[k] = v
                            }else{
                                if(/\d/.test(v)){
                                    arr[k] = parseInt(v)
                                }else if(/\d.\d/.test(v)){
                                    arr[k] = parseFloat(v)
                                }
                            }

                        })
                        row[key] = arr
                    }

                }else if(key == item['field_name'] && (item['type'] == 'upload_image' || item['type'] == 'upload_file') && typeof row[key] == 'string'){
                    const arr = row[key].split(',')
                    const file_list:AnyObject[] = []
                    if(arr.length > 0){
                        arr.forEach((file:string) => {
                            const arr2 = file.split('/')
                            const file_name = arr2[arr2.length-1]
                            if(file_name != ''){
                                file_list.push({
                                    name: file_name,
                                    url: file,
                                    field_name: key
                                })
                            }

                        })
                    }

                    row[key] = file_list
                }
            })
        })

        this.table_config.current_select_row = row
        this.import_config.form_title = '编辑'
        this.import_config.edit_dlg = true

        //表单加载完的回调
        this.import_config.loadForm(this, row)

    }

    /**
     * 保存行编辑数据
     */
    saveEditRow = (): void => {
        const row:AnyObject | undefined = toRaw(this.table_config.current_select_row)
        const save_data:AnyObject = {}  //存放需要保存的数据

        if(typeof row != 'undefined'){
            Object.keys(row).forEach((key) => {
                //只有列表中存在的字段才保存
                this.table_config.columns.forEach((field_info: AnyObject) => {
                    if(field_info.prop == key){
                        if(['bigint','int','smallint','tinyint'].indexOf(field_info.type) != -1){
                            save_data[key] = parseInt(row[key])
                        }else if(['decimal','double','float'].indexOf(field_info.type) != -1){
                            save_data[key] = parseFloat(row[key])
                        }else if(field_info.type == 'varchar' && row[key] != null && typeof row[key] == 'object'){
                            if(row[key].length == 0){
                                save_data[key] = ''
                            }else{
                                save_data[key] = row[key].join(',')
                            }

                        }else{
                            save_data[key] = row[key]
                        }
                    }
                })

                //将上传控件的列表数据转换成逗号分隔的字符串
                Object.values(this.table_config.form_info).forEach((item) => {
                    if (key == item['field_name'] && (item['type'] == 'upload_image' || item['type'] == 'upload_file')) {
                        if(typeof row[key + '_new_upload'] == 'object'){
                            if(row[key + '_new_upload'].length == 0){
                                save_data[key] = ''
                            }else{
                                const arr:Array<string> = []
                                row[key + '_new_upload'].forEach((val:AnyObject)=>{
                                    if(typeof val.url != 'undefined'){
                                        arr.push(val.url)
                                        if(this.table_config.current_select_row != undefined){
                                            this.table_config.current_select_row[key].push(val.url)
                                        }
                                    }
                                })
                                save_data[key] = arr.join(',')

                            }
                        }else if(typeof row[key] == 'object'){
                            if(row[key].length == 0){
                                save_data[key] = ''
                            }else{
                                const arr:Array<string> = []
                                row[key].forEach((val:AnyObject)=>{
                                    if(typeof val.url != 'undefined') arr.push(val.url)
                                })
                                save_data[key] = arr.join(',')
                            }
                        }
                    }
                })

            })

            this.import_config.edit_form_ref.validate((valid: boolean) => {
                if (valid) {
                    this.uploadDataService.saveRow(save_data)
                } else {
                    ElMessage.error('表单数据验证未通过！')
                }
            })
        }

        setTimeout(() => this.loadDataService.loadTableField(), 300) //加载列表表头字段

    }


    /**
     * 删除行数据
     * @param row
     */
    delRow = (row: AnyObject):void => {
        ElMessageBox.confirm(
            '确定要执行此删除操作?',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                draggable: true,
                center: true,
            }
        ).then(() => {
            this.loadDataService.delRow(row).then((res: AnyObject) => {
                if(res.status == 200){
                    if(res.data.code == 0){
                        ElMessage.success(res.data.msg)
                        this.search()
                    }else{
                        ElMessage.error(res.data.msg)
                    }
                }else{
                    ElMessage.error('删除失败'+ res.statusText)
                }
            })
        }).catch(() => {
            return false
        })
    }


    /**
     * 预览文件
     * @param file 文件信息
     */
    previewFile = (file:AnyObject):void => {
        window.open(file.url)
    }


    /**
     * 文件上传成功处理
     * @param response
     * @param file  当前上传的文件信息
     * @param fileList  上传的文件列表
     */
    uploadSuccess = (response: AnyObject, file:AnyObject, fileList:AnyObject[]):void => {
        if(file.status == 'success'){
            //取出字段名
            let field_name = ''
            if(file.response.code != 0){
                const arr = file.response.msg.split('|')
                field_name = arr[0].replace('异常：', '')
                ElMessage.error('上传失败！'+ arr[1])
                this.uploadRefs[field_name].abort(file)
                this.uploadRefs[field_name].handleRemove(file)
            }else{
                field_name = file.response.data.field_name
            }

            fileList.forEach((item) => {
                item.field_name = field_name
                if(typeof item.response != 'undefined'){
                    if(item.response.code != 0){
                        item.status = 'fail'
                        item.name += item.response.msg
                    }else{
                        item.url = item.response.data.url
                    }
                }
            })

            if(typeof this.table_config.current_select_row != 'undefined'){
                this.table_config.current_select_row[field_name + '_new_upload'] = fileList
            }

        }
    }

    /**
     * 设置上传组件ref
     * @param el
     */
    setUploadRef = (el: Ref, field_name: string):void => {
        if(el){
            this.uploadRefs[field_name] = el
        }
    }

    /**
     * 移除文件
     * @param file
     * @param fileList
     */
    fileRemove = (file:AnyObject, fileList:AnyObject[]):void => {
        if(typeof this.table_config.current_select_row != 'undefined'){
            this.table_config.current_select_row[file.field_name] = fileList
        }
    }

    /**
     * 获取编辑器内容
     * @param content
     */
    getEditorContent = (content:string, id: string):void => {
        if(typeof this.table_config.current_select_row != 'undefined') {
            this.table_config.current_select_row[id] = content
        }
    }

    /**
     * 修改列表展示方式
     */
    changeShowType = ():void => {
        this.table_config.data_show_type = this.table_config.data_show_type === 'table' ? 'card' : 'table'
    }

    /**
     * 实例挂载完后，页面显示初始化
     */
    mounted = ():void => {
        onMounted(() => {
			//只有设置了API地址才执行拉取后端数据
			if(this.table_config.api_url != ''){
				this.loadDataService.loadTableField() //加载列表表头字段
				this.search(); //加载列表数据
			}

            //列表响应式显示处理
            this.resizeWin()
            window.onresize = () => {
                this.resizeWin()
            }



        })
    }




}
