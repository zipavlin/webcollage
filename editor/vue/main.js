import Vue from 'vue'
import App from './App.vue'
import store from './store';

const app = new Vue({
    el: '#app',
    store,
    render: a => a(App)
});