import 'babel-polyfill'
import Vue from 'vue'
import ElementUI from 'element-ui';
import './assets/css/reset.css'
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
import router from './router'
import store from './store'

Vue.use(ElementUI);
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
