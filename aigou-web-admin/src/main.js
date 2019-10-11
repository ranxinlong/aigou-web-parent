import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
//卸载mock，放置请求被拦截
/*import Mock from './mock'
Mock.bootstrap();*/

//配置全局的axios，连接后端
import axios from 'axios'
axios.defaults.baseURL = "http://localhost:6969/services" //网关的URL地址
Vue.prototype.$http = axios

import 'font-awesome/css/font-awesome.min.css'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

//NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes
})

/*每次路由之前的事件*/
router.beforeEach((to, from, next) => {
  //NProgress.start();
    //如果要跳转登录页面，就清空用户数据
  if (to.path == '/login') {
    sessionStorage.removeItem('user');
  }
  //获取浏览器里面的session对象里面的user
  let user = JSON.parse(sessionStorage.getItem('user'));
  //如果user为空就跳转到登录页面
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    //如果user不为空，就正常跳转
    next()
  }
})

//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')

