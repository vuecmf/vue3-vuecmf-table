import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'

import VuecmfEditor from 'vue-vuecmf-editor'
import VuecmfDialog from 'vue-vuecmf-dialog'
import VuecmfTable from "../packages/index"

createApp(App).use(VuecmfTable).use(VuecmfEditor).use(VuecmfDialog).mount('#app')

