import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'

/* 增加element plus 组件库 */
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'


import VuecmfTable from "../packages/index"

createApp(App).use(ElementPlus).use(VuecmfTable).mount('#app')

