import Vue from 'vue';
import VuexHistory from 'vuex-history';
import store from './store';

Vue.use(VuexHistory);

export default new VuexHistory(store, ['items'], 25);