import Vue from 'vue';
import Vuex from 'vuex';
import history from './history';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        items: [
            {angle:0, clip:[], height:64, selected:false, state:null, url:"http://interactjs.io/docs", width:334, x:714, y:267}
        ],
        zoom: 0,
        contextMenu: {
            id: null,
            type: null,
            top: 0,
            left: 0
        }
    },
    mutations: {
        'item.mrr': function (state, payload) {
            for (let key in payload) {
                if (key === 'index') continue;
                if (state.items[payload.index][key] === payload[key]) continue;
                state.items[payload.index][key] = payload[key];
            }
        },
        'item.clip': function (state, payload) {
            console.log(payload);
            state.items[payload.index].clip = payload.clip;
        },
        'item.setInitialState': function (state, id) {
            const initialSettings = {
                width: window.innerWidth,
                height: window.innerHeight,
                x: 0,
                y: 0,
                clip: [],
                angle: 0,
                selected: false
            };

            for (let key in initialSettings) {
                if (!state.items[id][key]) Vue.set(state.items[id], key, initialSettings[key]);
            }
        },

        'wrap.select': function (state, id) {
            Vue.set(state.items[id], 'selected', true);
        },
        'wrap.unselect': function (state, id) {
            Vue.set(state.items[id], 'selected', false);
        },

        // collage item child handlers


        // stage handlers
        'stage.zoomIn': function (state, action) {
            state.zoom += 100;
        },
        'stage.zoomOut': function (state, action) {
            state.zoom -= 100;
        },

        // context menu
        'contextMenu.close': function (state) {
            state.contextMenu = {
                id: null,
                type: null,
                top: 0,
                left: 0
            }
        },
        'contextMenu.open': function (state, payload) {
            payload.open = true;
            state.contextMenu = payload;
        },

        'contextMenu.mrr.setPosition': function (state) {
            const id = state.contextMenu.id;
            let size = prompt("Please enter position (left, top):", `${state.items[id].x || 0}, ${state.items[id].y || 0}`);
            if (!(size == null || size === "")) {
                // parse
                size = size.match(/^(\d+)(?:px)?\s*[x,*]\s*(\d+)?(?:px)?\s*$/i);
                // set width
                if (size[1] && !isNaN(size[1])) state.items[id].x = parseInt(size[1]);
                // set height
                if (size[2] && !isNaN(size[2])) state.items[id].y = parseInt(size[2]);
            }
        },
        'contextMenu.mrr.setSize': function (state) {
            const id = state.contextMenu.id;
            let size = prompt("Please enter size (width x height):", `${state.items[id].width || 0} x ${state.items[id].height || 0}`);
            if (!(size == null || size === "")) {
                // parse
                size = size.match(/^(\d+)(?:px)?\s*[x,*]\s*(\d+)?(?:px)?\s*$/i);
                // set width
                if (size[1] && !isNaN(size[1])) state.items[id].width = parseInt(size[1]);
                // set height
                if (size[2] && !isNaN(size[2])) state.items[id].height = parseInt(size[2]);
            }
        },
        'contextMenu.mrr.setRotation': function (state) {
            const id = state.contextMenu.id;
            const rotation = prompt("Please enter rotation:", state.items[id].angle || 0);
            if (!(rotation == null || rotation === "" || isNaN(rotation))) {
                state.items[id].angle = rotation;
            }
        },
        'contextMenu.mrr.done': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = null;
        },

        'contextMenu.item.openMrr': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = 'mrr';
        },
        'contextMenu.item.openClip': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = 'clip';
        },



    }
});