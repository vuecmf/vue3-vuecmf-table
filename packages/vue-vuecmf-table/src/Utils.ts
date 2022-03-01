// +----------------------------------------------------------------------
// | Copyright (c) 2020~2022 http://www.vuecmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( https://github.com/emei8/vuecmf/blob/master/LICENSE )
// +----------------------------------------------------------------------
// | Author: emei8 <2278667823@qq.com>
// +----------------------------------------------------------------------

import FileSaver from 'file-saver'
import XLSX, {BookType, WorkBook, WorkSheet, WritingOptions} from 'xlsx'
import {VuecmfTable} from "./typings/VuecmfTable";
import AnyObject = VuecmfTable.AnyObject;


/**
 * 字符串转ArrayBuffer
 * @param s
 */
const stringToBuffer = (s:string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i=0; i < s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

/**
 * 将一个sheet转成最终的excel文件的blob对象
 * @param sheet
 * @param file_type
 * @param sheet_name
 */
const sheet2blob = (sheet:WorkSheet, file_type:BookType, sheet_name?: string) => {
    sheet_name = sheet_name || 'sheet1';

    const workbook:WorkBook = {
        SheetNames: [sheet_name],
        Sheets: {}
    };

    workbook.Sheets[sheet_name] = sheet;
    // 生成excel的配置项
    const wopts:WritingOptions = {
        bookType: file_type, // 要生成的文件类型, 支持 xlsx, csv, xml, txt
        bookSST: false, // 是否生成Shared String Table，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary'
    };
    const wbout = XLSX.write(workbook, wopts);
    const blob = new Blob([stringToBuffer(wbout)], {type:"application/octet-stream,charset=UTF-8"});

    return blob;
}


/**
 * 保存导出
 * 参数：
 *      dataList  导出的数据集合列表
 *      fileType  导出保存的文件类型
 *      fileName  导出保存的文件名
 */
export function jsonExport(dataList: AnyObject[],file_type:BookType,fileName: string):void {
    const cur_date = new Date()
    const sheet = XLSX.utils.json_to_sheet(dataList)
    FileSaver.saveAs(sheet2blob(sheet,file_type), fileName + '_' + cur_date.toLocaleString() + '.' + file_type)
}

/**
 * 导入Excel数据
 * @param fileEvent  文件事件对象
 * @param callback  回调函数， 处理上传的数据
 * @returns {boolean}
 */
export function jsonImport(fileEvent: Event, callback: (file_data: VuecmfTable.AnyObject[]) => boolean):void | boolean {
    if(!fileEvent.target.files) {
        return false
    }

    const file = fileEvent.target.files[0]
    const reader = new FileReader()
    let json_data = []

    reader.onload = (e) => {
        if(e.target == null) return false
        const data = e.target.result
        const binaryData = XLSX.read(data, {
            type: 'binary' //以二进制的方式读取
        })

        const sheet = binaryData.Sheets[binaryData.SheetNames[0]]
        json_data = XLSX.utils.sheet_to_json(sheet)
        callback(json_data)
    }

    reader.readAsBinaryString(file)
}


/**
 * 功能：解析EXCEL文件中日期字段，默认EXCEL中日期字段为变为大于40000的整型数字，需要转换成 形如 YYYY-MM-DD
 * @param {*} dateObj  日期对象
 * @param {*} fmt  格式化字符串：例如 Y/m/d H:i:s
 */
export function dateFormat(dateObj: AnyObject, fmt: string):string {
    const obj: AnyObject = {
        "m+": dateObj.getMonth() + 1, //月份
        "d+": dateObj.getDate() - 1, //日
        "H+": dateObj.getHours(), //小时
        "i+": dateObj.getMinutes(), //分
        s: dateObj.getSeconds() //秒
    };
    if (/(Y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, dateObj.getFullYear() + "");
    for (const k in obj) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, obj[k] < 10 ? "0" + obj[k] : obj[k]);
        }
    }
    return fmt;
}

/**
 * 获取文件的扩展名
 * @param filename
 */
export function getFileExt(filename: string): string {
    if (filename == '' || filename == null) return '';
    const file_arr = filename.split('.');
    return (file_arr[file_arr.length - 1]).toLowerCase();
}

