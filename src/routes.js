import App from './App'
import Divide from './Divide'
import Combine from './Combine'
import Resize from './Resize'

export default [
  {
    path: '/', component: App,
    children: [
      { path: 'divide', component: Divide },
      { path: 'combine', component: Combine },
      { path: 'resize', component: Resize },
    ],
  },
]
