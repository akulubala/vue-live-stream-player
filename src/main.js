import Vue from 'vue';
import App from './App.vue';
import VideoPlayBack from './plugins/VideoPlayBack';
import AirbnbStyleDatepicker from 'akulubala-vue-airbnb-style-datepicker'
import 'akulubala-vue-airbnb-style-datepicker/dist/vue-airbnb-style-datepicker.min.css'

// see docs for available options
const datepickerOptions = {
  sundayFirst: false,
  days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
  monthNames: [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ],
  colors: {
    selected: '#00a699',
    inRange: '#66e2da',
    selectedText: '#fff',
    text: '#565a5c',
    inRangeBorder: '#33dacd',
    disabled: '#fff',
  },
  texts: {
    apply: '确定',
    cancel: '取消'
  },
}

// make sure we can use it in our components
Vue.use(VideoPlayBack)

Vue.use(AirbnbStyleDatepicker, datepickerOptions)

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
