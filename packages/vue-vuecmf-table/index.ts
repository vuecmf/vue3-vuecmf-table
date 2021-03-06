// +----------------------------------------------------------------------
// | Copyright (c) 2020~2021 http://www.vuecmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( https://github.com/emei8/vuecmf/blob/master/LICENSE )
// +----------------------------------------------------------------------
// | Author: emei8 <2278667823@qq.com>
// +----------------------------------------------------------------------

import VuecmfTable from './src/VuecmfTable.vue'
import {App, Component} from 'vue'
import 'element-plus/dist/index.css'
import { components } from './src/element'

/**
 * 为组件提供 install 安装方法，供按需引入
 * @param app
 */
VuecmfTable.install = (app: App):void => {
  if(VuecmfTable.installed) return
  VuecmfTable.installed = true
  app.component(VuecmfTable.name, VuecmfTable)

  //按需导入Element Plus组件
  components.forEach((component:Component) => {
    if(typeof component.name != 'undefined'){
      app.component(component.name, component)
    }
  })

}

// 默认导出组件
export default VuecmfTable