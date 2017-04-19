import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App'
import Divide from './Divide'
import Combine from './Combine'
import Rescale from './Rescale'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', component: App,
    children: [
      { path: 'divide', component: Divide },
      { path: 'combine', component: Combine },
      { path: 'rescale', component: Rescale },
    ],
  },
]
const router = new VueRouter({
  routes
})

const app = new Vue({
  router
}).$mount('#app')
