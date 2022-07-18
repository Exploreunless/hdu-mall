import { createApp } from 'vue'
import App from '@/App.vue'
import '@/styles/reset.css'
import 'element-plus/dist/index.css'
import '@/styles/base.less'
import router from '@/router'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/iconfont/iconfont.css'
import store from '@/store'
import elementPlus from 'element-plus'
import '@/icons'



const app = createApp(App);

app.use(router).use(store).use(elementPlus);
app.mount('#app');
