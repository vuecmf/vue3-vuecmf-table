// +----------------------------------------------------------------------
// | Copyright (c) 2020~2021 http://www.vuecmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( https://github.com/emei8/vuecmf/blob/master/LICENSE )
// +----------------------------------------------------------------------
// | Author: emei8 <2278667823@qq.com>
// +----------------------------------------------------------------------

import VuecmfTable from './src/VuecmfTable.vue'
import { App } from 'vue'

/**
 * 为组件提供 install 安装方法，供按需引入
 * @param app
 */
VuecmfTable.install = (app: App):void => {
  if(VuecmfTable.installed) return
  VuecmfTable.installed = true
  app.component(VuecmfTable.name, VuecmfTable)
}

// 默认导出组件
export default VuecmfTable