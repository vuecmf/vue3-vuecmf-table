// +----------------------------------------------------------------------
// | Copyright (c) 2020~2024 http://www.vuecmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( https://github.com/emei8/vuecmf/blob/master/LICENSE )
// +----------------------------------------------------------------------
// | Author: emei8 <2278667823@qq.com>
// +----------------------------------------------------------------------

import { jsonImport, jsonExport, dateFormat } from "../Utils"
import {AnyObject} from "../typings/VuecmfTable"
import Base from "./Base"
import { ElMessage } from 'element-plus'

/**
 * 列表导入数据服务类
 */
export default class UploadData extends Base{
    field_options: AnyObject;       //字段选项信息
    relation_info: AnyObject;       //字段关联信息
    form_info: AnyObject;           //列表表单信息
    import_excel_data: AnyObject;   //导入的文件内容
    import_current_page: number;    //导入当前进度页

    table_config: AnyObject;    //列表配置信息
    import_config: AnyObject;   //导入配置信息
    tpl_file_name: string;      //下载模板文件名前缀

    constructor(
        table_config: AnyObject,
        import_config: AnyObject,
        tpl_file_name: string,
        token: string,
        timeout: number  //请求后端超时限制
    ) {
        super(token, timeout)
        this.field_options = {}
        this.relation_info = {}
        this.form_info = {}
        this.import_excel_data = []
        this.import_current_page = 0

        this.table_config = table_config
        this.import_config = import_config
        this.tpl_file_name = tpl_file_name

    }

    /**
     * 保存单条行数据
     * @param row  一条行数据
     */
    saveRow = (row: AnyObject):void => {
        this.post(this.import_config.save_api_url, Object.assign(
            { data:row },
            this.table_config.extend_params
        )).then((data) => {
            if(data.status == 200 && data.data.code == 0){
                ElMessage.success(data.data.msg)
                this.import_config.edit_dlg = false
            }else if(data.data.code != 0){
                ElMessage.error(data.data.msg)
            }
        })
    }

    /**
     * 下载模板文件
     */
    downloadTemplate = ():void|boolean => {
        const tpl_data = [];
        const item:AnyObject = [];

        //将下载的字段名替换成表格的表头名称
        this.table_config.columns.forEach(function (v:AnyObject) {
            if (['action','id'].indexOf(v["prop"]) == -1 && v["prop"] != undefined) {
                //过滤HTML标签
                const label = v["label"].replace(/<[^>]*>/g, "");
                item[label] = "";
            }
        });
        tpl_data.push(item);
        jsonExport(tpl_data, "xlsx", this.tpl_file_name + "数据模板");
    }

    /**
     * 第一步： 触发上传事件
     * @param field_options  字段选项信息
     * @param form_info  字段表单信息
     * @param relation_info  字段关联信息
     */
    triggerUpload = (field_options: AnyObject, form_info: AnyObject, relation_info: AnyObject):void => {
        //初始化相关信息
        this.import_config.import_file_name = ''
        this.import_config.parse_data_tips = ''
        this.import_config.import_file_error = ''
        this.import_config.is_import_disabled = true
        this.import_excel_data = Promise.resolve([])
        this.import_config.import_percentage = 0
        this.import_current_page = 0

        this.import_config.import_data_form.reset()
        this.import_config.import_file_form.click()
        this.field_options = field_options
        this.relation_info = relation_info
        this.form_info = form_info
    }

    /**
     * 第二步： 上传数据文件
     * @param fileEvent  文件选择事件对象
     */
    importExcel = (fileEvent: Event):boolean => {
        if(typeof fileEvent == 'undefined' ||
            typeof fileEvent.target == 'undefined' ||
            typeof fileEvent.target.files == 'undefined'){
            return false
        }

        const fileObj = fileEvent.target.files[0]
        if(fileObj.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            && fileObj.type != 'application/vnd.ms-excel'){
            ElMessage.error('上传文件类型错误！只能上传文件xlsx,xls类型文件');
            return false
        }

        this.import_config.import_file_name = fileObj.name

        jsonImport(fileEvent, this.callbackUploadExcelData)
        return true
    }

    /**
     * 第三步： 获取上传的EXCEL数据的回调函数， 处理解析数据
     * @param file_data  读取的文件数据
     */
    private callbackUploadExcelData = (file_data: AnyObject[]): boolean => {
        if(file_data.length == 0) return false

        const new_data:AnyObject[] = []
        this.import_config.parse_data_tips = '<span style="color:#F56C6C">正在解析文件，请稍后...</span>';

        //字段映射转换数据
        file_data.forEach( (row,row_index) => {
            const item_data:AnyObject = {}
            this.table_config.columns.forEach( (field:AnyObject) => {
                if(field.prop == 'action' || typeof row[field.label] == 'undefined') return false
                let new_val = row[field.label]
                if(typeof this.form_info[field.field_id] != 'undefined'
                    && ['datetime','date'].indexOf(this.form_info[field.field_id].type) != -1
                    && new_val > 40000 && new_val < 90000
                ){
                    new_val = dateFormat(new Date(1900, 0, new_val),'Y/m/d H:i:s')  //如果日期变成类似42747 则用这种方式转换
                }else if(typeof this.field_options != 'undefined' &&
                    typeof this.field_options[field.field_id] != 'undefined' &&
                    this.field_options[field.field_id] != ''
                ){
                    let flag = false
                    Object.keys(this.field_options[field.field_id]).forEach((key) => {
                        const treeItem = this.field_options[field.field_id][key]
                        if(treeItem['label'].replace(/[┊┊┈└─]/g,'').trim() == new_val){
                            flag = true
                            new_val = treeItem['value']
                        }
                    })

                    if(!flag){
                        this.import_config.import_file_error += '第 '+ (row_index+2) +' 行中的“ '+new_val+' ”在系统中没有找到对应的“ '+field['label']+" ”<br>";
                    }
                }else if(typeof this.relation_info.full_options != 'undefined' &&
                    typeof this.relation_info.full_options[field.field_id] != 'undefined' &&
                    this.relation_info.full_options[field.field_id] != ''
                ){
                    let flag = false
                    let res = 0
                    Object.keys(this.relation_info.full_options[field.field_id]).forEach((key) => {
                        const treeItem = this.relation_info.full_options[field.field_id][key]
                        if(treeItem['label'].replace(/[┊┊┈└─]/g,'').trim() == new_val){
                            flag = true
                            res = treeItem['value']
                        }
                    })
                    new_val = res
                    if(!flag){
                        this.import_config.import_file_error += '第 '+ (row_index+2) +' 行中的“ '+new_val+' ”在系统中没有找到对应的“ '+field['label']+" ”<br>";
                    }
                }

                item_data[field['prop']] = new_val
            })
            new_data[row_index] = item_data
        })

        if(this.import_config.import_file_error != ''){
            this.import_config.is_import_disabled = true
            this.import_config.import_data_form.reset()
            return false
        }else{
            this.import_config.parse_data_tips = '<span style="color:#409EFF">文件解析完成，共解析出 <strong>' + new_data.length + '</strong> 条记录。</span>';
            this.import_excel_data = new_data
            this.import_config.is_import_disabled = false
        }
        return true
    }

    /**
     * 第四步： 开始导入数据
     */
    startImportData = ():boolean => {
        this.import_config.is_import_disabled = true

        //每次处理500条
        const page_num = 500
        const pages = Math.ceil(this.import_excel_data.length / page_num)

        if(this.import_current_page >= pages){
            if(this.import_config.import_percentage == 100){
                this.import_config.parse_data_tips = '<span style="color: #67C23A">导入成功！</span>'
            }
            return false
        }

        //分页取出数据
        const post_data = this.import_excel_data.slice(this.import_current_page * page_num,(this.import_current_page + 1) * page_num)

        if( post_data != null && post_data.length != 0){
            const submit_data = {
                data: JSON.stringify(post_data)
            }

            this.post(this.import_config.import_api_url, Object.assign(submit_data, this.table_config.extend_params)).then((data) => {
                if(data.status == 200 && data.data.code == 0){
                    this.import_config.import_percentage = Math.ceil((this.import_current_page + 1) / pages * 100)
                    this.import_current_page ++
                    this.startImportData()
                }else if(data.data.code != 0){
                    this.import_config.import_file_error = data.data.msg + '<br>'
                }
            })
        }

        return true
    }
}

