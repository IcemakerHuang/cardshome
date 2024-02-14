/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../store'
import router from '../router'
import VuetifyUseDialog from 'vuetify-use-dialog'
// -! add
import VueFileAgentNext from '@boindil/vue-file-agent-next' // 檔案上傳元件vue file agent
import '@boindil/vue-file-agent-next/dist/vue-file-agent-next.css' // 檔案上傳元件vue file agent的css

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(VuetifyUseDialog)
    .use(pinia) // 注意plugins外掛順序(ex: 先router再pinia，會抓不到store)
    .use(router)
    .use(VueFileAgentNext) // 檔案上傳元件vue file agent
}
