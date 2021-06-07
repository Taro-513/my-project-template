import Vue from 'vue'
import store from '../store'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

//清除上一页 还未结束的请求
router.afterEach((to, from) => {
  //登录页不清除，可能会有枚举接口之类的
  if (from.path !== '/login') {
    if (store.state.httpRequestList.length > 0) {
      // 强行中断时才向下执行
      store.state.httpRequestList.forEach(item => {
        item && item('interrupt')
      })
    }
  }
  store.commit('setHttpRequestList', [])
})
export default router
