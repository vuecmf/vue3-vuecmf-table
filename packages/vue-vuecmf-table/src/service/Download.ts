// +----------------------------------------------------------------------
// | Copyright (c) 2020~2024 http://www.vuecmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( https://github.com/emei8/vuecmf/blob/master/LICENSE )
// +----------------------------------------------------------------------
// | Author: emei8 <2278667823@qq.com>
// +----------------------------------------------------------------------

import { jsonExport } from "../Utils";
import type {AnyObject} from "../typings/VuecmfTable";
import type {BookType} from "xlsx";

/**
 * 列表导出数据相关服务类
 */
export default class Download{
    export_data: AnyObject[];   //存放导出的数据
    current_page: number;       //当前页码
    page_size: number;          //每次拉取条数
    columns: AnyObject;         //列表字段信息
    field_options: AnyObject;   //字段选项信息
    relation_info: AnyObject;   //字段关联信息
    export_file_type: BookType; //导出文件类型

    export_config: AnyObject;   //导出配置信息
    //拉取回调函数
    pullData: (current_page: number, page_size: number, callback: (arg: AnyObject) => (AnyObject | boolean), action?: string) => AnyObject;

    constructor(
        export_config: AnyObject,
        pullData: (current_page: number, page_size: number, callback: (arg: AnyObject) => (AnyObject | boolean), action?: string) => AnyObject
    ) {
        this.export_data = []
        this.current_page = 0
        this.field_options = {}
        this.relation_info = {}
        this.page_size = 500
        this.export_file_type = 'xlsx'
        this.columns = []

        this.export_config = export_config
        this.pullData = pullData
    }

    /**
     * 获取导出行数据
     * @param val
     */
    private getExportDataItem = (val: AnyObject):AnyObject => {
        const item: AnyObject = [];
        //将下载的字段名替换成表格的表头名称
        this.columns.forEach((field:AnyObject) => {
            //只下载显示的列
            if (field.show == true) {
                //过滤HTML标签
                const label = field.label.replace(/<[^>]*>/g, "");
                let value = val[field.prop];

                if(this.field_options != null && typeof this.field_options[field.field_id] != 'undefined'){
                    let res = ''
                    if(this.field_options[field.field_id].length != undefined){
                        this.field_options[field.field_id].forEach((treeItem: AnyObject) => {
                            if(treeItem['value'] == value){
                                res = treeItem.label != undefined ? treeItem.label : ''
                            }
                        })
                        value = res.replace(/[┊┊┈└─]/g,'').trim()
                    }else{
                        value = this.field_options[field.field_id][value]
                    }
                }else if(this.relation_info != null && this.relation_info.full_options != undefined && typeof this.relation_info.full_options[field.field_id] != 'undefined'){
                    let res = this.relation_info.full_options[field.field_id][value]
                    if(typeof res != 'string'){
                        res = ''
                        this.relation_info.full_options[field.field_id].forEach((row: AnyObject) => {
                            if(row['value'] == value){
                                res = row.label != undefined ? row.label : ''
                            }
                        })
                    }

                    value = res.replace(/[┊┊┈└─]/g,'').trim()

                }

                item[label] = value;
            }
        });
        return item
    }

    /**
     * 获取目录树导出的数据
     * @param data
     */
    private getTreeExportData = (data: AnyObject):void => {
        data.forEach((val:AnyObject) => {
            this.export_data.push(this.getExportDataItem(val));
            if(val.children != undefined && val.children.length > 0){
                this.getTreeExportData(val.children)
            }
        })
    }


    /**
     * 拉取要导出的数据的回调
     * @param data  列表数据
     */
    private getExportData = (data: AnyObject):boolean => {
        if (data.data.data.data == undefined) {
            this.export_config.download_error = '接口异常，无法拉取数据！'
            return false
        }

        const total_pages = Math.ceil(parseInt(data.data.data.total) / this.page_size)

        if(total_pages == 0){
            this.export_config.download_error = '列表无数据！'
            return false
        }

        if(this.export_config.row_key != ''){
            this.getTreeExportData(data.data.data.data)
        }else{
            data.data.data.data.forEach((val:AnyObject) => {
                this.export_data.push(this.getExportDataItem(val));
            });
        }

        this.export_config.percentage = Math.ceil(
            this.current_page / total_pages * 100
        );

        //全部拉取完后，开始下载数据
        if (this.current_page == total_pages) {
            this.export_config.percentage = 100
            jsonExport(this.export_data, this.export_file_type, this.export_config.export_file_name);
            this.export_data = [];
            this.export_config.show_download_dlg = false
        } else {
            this.current_page ++
            this.downloadFile(this.current_page);
        }
        return true
    }

    /**
     * 逐页拉取数据
     * @param current_page 当前页码
     */
    private downloadFile = (current_page: number): void => {
        this.pullData(current_page, this.page_size, this.getExportData);
    }

    /**
     * 下载导出
     * @param type  文件类型
     * @param current_page 当前页码
     * @param columns  列头字段信息
     * @param field_options  字段选项信息
     * @param relation_info  字段关联信息
     */
    exportFile = (type: BookType, current_page: number, columns: AnyObject, field_options: AnyObject, relation_info: AnyObject):void => {
        this.export_file_type = type;
        this.current_page = current_page;
        this.columns = columns
        this.field_options = field_options
        this.relation_info = relation_info

        this.export_config.percentage = 0
        this.export_config.show_download_dlg = true
        this.export_config.download_error = ''

        //逐页拉取数据
        this.downloadFile(this.current_page);
    }
}

