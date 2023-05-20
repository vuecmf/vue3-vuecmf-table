import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'

/* v1.21+版本开始需要导入此图标样式 */
import "bootstrap-icons/font/bootstrap-icons.css"

import VuecmfEditor from 'vue-vuecmf-editor'
import VuecmfDialog from 'vue-vuecmf-dialog'
import VuecmfTable from "../packages/index"

createApp(App).use(VuecmfTable).use(VuecmfEditor).use(VuecmfDialog).mount('#app')

