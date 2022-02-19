import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'

import VuecmfEditor from 'vue-vuecmf-editor'
import VuecmfTable from "../packages/index"

createApp(App).use(VuecmfTable).use(VuecmfEditor).mount('#app')

