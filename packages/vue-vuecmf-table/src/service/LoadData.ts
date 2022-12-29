// +----------------------------------------------------------------------
// | Copyright (c) 2020~2022 http://www.vuecmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( https://github.com/emei8/vuecmf/blob/master/LICENSE )
// +----------------------------------------------------------------------
// | Author: emei8 <2278667823@qq.com>
// +----------------------------------------------------------------------

import Base from "./Base"
import {VuecmfTable} from "../typings/VuecmfTable"
import AnyObject = VuecmfTable.AnyObject

/**
 * 列表加载数据相关服务类
 */
export default class LoadData extends Base {
    private table_config: AnyObject;  //列表配置信息
    emit: EmitFn<EE[]>|null;          //异常信息回调处理函数

    constructor(
        table_config: AnyObject,  //列表配置信息
        token: string,            //token信息
        emit:EmitFn<EE[]>         //异常信息回调处理函数
    ) {
        super(token);
        this.table_config = table_config
        this.emit = emit
    }

    /**
     * 删除行数据
     * @param row
     */
    delRow = (row: AnyObject):AnyObject => {
        return this.post(this.table_config.del_api_url, {
            data: row
        }).then(function (res) {
            return res
        });
    }

    /**
     * 拉取数据
     * @param current_page  当前页码
     * @param page_size  每次拉取条数
     * @param callback  回调处理函数
     * @param action  动作名称
     */
    pullData = (current_page:number, page_size:number, callback: (arg:AnyObject) => AnyObject|boolean , action?:string):AnyObject => {
        if (action != undefined && action == "getField") {
            //拉取表格字段信息
            return this.post(this.table_config.api_url, {
                data: { action: action, filter: this.table_config.field_filter }
            }).then(function (data) {
                return callback(data);
            });
        } else {
            //拉取列表数据
            const post_data:AnyObject = {
                page_size: page_size,
                order_field: this.table_config.order_field,
                order_sort: this.table_config.order_sort,
                keywords: this.table_config.keywords,
                filter: this.table_config.filter_form,
                //兼容后端只接收offset 和 limit 参数分页处理
                offset: this.table_config.page_size * (current_page - 1),
                limit: this.table_config.page_size
            }
            post_data[this.table_config.page] = current_page

            return this.post(this.table_config.api_url, {data: post_data}).then(function (data) {
                return callback(data);
            });
        }
    }

    /**
     * 刷新列表
     */
    reloadPage = ():AnyObject => {
        return this.pullData(this.table_config.current_page, this.table_config.page_size, this.getList);
    }

    /**
     * 加载表格字段信息
     */
    loadTableField = ():void => {
        this.pullData(1, this.table_config.page_size, this.updateTableField, "getField");
    }

    /**
     * 加载表格字段回调
     * @param data 需处理的列表字段数据
     */
    private updateTableField = (data:AnyObject): boolean => {
        this.table_config.columns = data.data.data.field_info
        this.table_config.field_options = typeof data.data.data.field_option != 'undefined' ? data.data.data.field_option : {}
        this.table_config.form_info = typeof data.data.data.form_info != 'undefined' ? data.data.data.form_info : {}
        this.table_config.form_rules = typeof data.data.data.form_rules != 'undefined' ? data.data.data.form_rules : []
        this.table_config.relation_info = typeof data.data.data.relation_info != 'undefined' ? data.data.data.relation_info : {}

        if(typeof this.table_config.columns != 'undefined'){
            this.table_config.columns.forEach((val: AnyObject) => {
                val['sort'] = ''
                if (val.show == true) {
                    this.table_config.check_column_list.push(val.label)
                }
                //初始化搜索表单值
                if(val.filter == true){
                    this.table_config.filter_form[val.prop] = typeof this.table_config.relation_info.options == 'object' && typeof this.table_config.relation_info.options[val.field_id] == 'object' ? []:''
                }
                //将选项值列表中的数值转换成与对应字段的值同类型
                if(this.table_config.field_options != {} && this.table_config.field_options[val.field_id] != undefined){
                    if(['bigint','int','smallint','tinyint'].indexOf(val.type) != -1){
                        Object.keys(this.table_config.field_options[val.field_id]).forEach((key) => {
                            this.table_config.field_options[val.field_id][key]['value'] = parseInt(this.table_config.field_options[val.field_id][key]['value'])
                        })
                    }else if(['decimal','double','float'].indexOf(val.type) != -1){
                        Object.keys(this.table_config.field_options[val.field_id]).forEach((key) => {
                            this.table_config.field_options[val.field_id][key]['value'] = parseFloat(this.table_config.field_options[val.field_id][key]['value'])
                        })
                    }
                }
                //若存关联信息，则将关联信息中的选项值转换成与对应字段的值同类型
                if(this.table_config.relation_info != {}){
                    if(typeof this.table_config.relation_info.full_options == 'object' && this.table_config.relation_info.full_options[val.field_id] != undefined){
                        if(['bigint','int','smallint','tinyint'].indexOf(val.type) != -1){
                            Object.keys(this.table_config.relation_info.full_options[val.field_id]).forEach((key) => {
                                this.table_config.relation_info.full_options[val.field_id][key]['value'] = parseInt(this.table_config.relation_info.full_options[val.field_id][key]['value'])
                            })
                        }else if(['decimal','double','float'].indexOf(val.type) != -1){
                            Object.keys(this.table_config.relation_info.full_options[val.field_id]).forEach((key) => {
                                this.table_config.relation_info.full_options[val.field_id][key]['value'] = parseFloat(this.table_config.relation_info.full_options[val.field_id][key]['value'])
                            })
                        }
                    }
                    if(typeof this.table_config.relation_info.options == 'object' && this.table_config.relation_info.options[val.field_id] != undefined){
                        if(['bigint','int','smallint','tinyint'].indexOf(val.type) != -1){
                            Object.keys(this.table_config.relation_info.options[val.field_id]).forEach((key) => {
                                this.table_config.relation_info.options[val.field_id][key]['value'] = parseInt(this.table_config.relation_info.options[val.field_id][key]['value'])
                            })
                        }else if(['decimal','double','float'].indexOf(val.type) != -1){
                            Object.keys(this.table_config.relation_info.options[val.field_id]).forEach((key) => {
                                this.table_config.relation_info.options[val.field_id][key]['value'] = parseFloat(this.table_config.relation_info.options[val.field_id][key]['value'])
                            })
                        }
                    }
                }
            })
        }

        //若有表单设置信息，取出各表单标签长度，计算表单标签宽度
        if(this.table_config.form_info != {}){
            let label_length:number[] = []

            Object.keys(this.table_config.form_info).forEach((key) => {
                let char_len = this.table_config.form_info[key].label.length
                if(/^[a-zA-Z0-9\s]*$/.test(this.table_config.form_info[key].label)){
                    char_len = Math.floor(char_len / 2)
                }
                label_length.push(char_len)
            })

            label_length = label_length.sort(function (a,b){ return b - a })
            const max_len = label_length[0]
            this.table_config.form_label_width = max_len as number * 18 + 16
        }

        this.emit('afterLoadTable', this.table_config)

        return true
    }

    /**
     * 拉取列表数据的回调
     * @param data 需处理的列表数据
     */
    private getList = (data: AnyObject):boolean => {
        if (data.data.code != 0 || typeof data.data.data.data == 'undefined') {
            let msg = "接口异常，无法拉取数据！";
            if (typeof data.data.msg != 'undefined') msg = msg + data.data.msg;
            this.emit('exception', msg, data.data.code)
        }else{
            this.table_config.table_data = data.data.data.data
            this.table_config.total = parseInt(data.data.data.total)
            this.table_config.loadingService.close()
        }
        return true
    }

}


