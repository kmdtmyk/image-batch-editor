import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App'
import Divide from './Divide'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', component: App,
    children: [
      { path: 'divide', component: Divide },
    ],
  },
]
const router = new VueRouter({
  routes
})

const app = new Vue({
  router
}).$mount('#app')
