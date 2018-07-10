import Vue from 'vue';
import Vuex from 'vuex';
import history from './history';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        items: [
            {url: 'http://interactjs.io/docs'}
        ],
        zoom: 0,
        itemContextMenu: {
            id: null,
            top: 0,
            left: 0,
            open: false
        }
    },
    mutations: {
        // item wrap handlers
        'wrap.setInitialState': function (state, id) {
            const initialSettings = {
                width: window.innerWidth,
                height: window.innerHeight,
                left: 0,
                top: 0,
                points: [],
                clip: '',
                selected: false
            };

            for (let key in initialSettings) {
                if (!state.items[id][key]) Vue.set(state.items[id], key, initialSettings[key]);
            }
        },
        'wrap.moveresize': function (state, payload) {
            for (let key in payload) {
                if (payload.hasOwnProperty(key) && key !== 'id') {
                    switch(key) {
                        case 'left': case 'top': case 'rotate':
                        let newValue = (state.items[payload.id][key] || 0) + payload[key];
                        Vue.set(state.items[payload.id], key, newValue);
                        break;
                        default:
                            Vue.set(state.items[payload.id], key, payload[key]);
                            break;
                    }
                }
            }
        },
        'wrap.select': function (state, id) {
            Vue.set(state.items[id], 'selected', true);
        },
        'wrap.unselect': function (state, id) {
            Vue.set(state.items[id], 'selected', false);
        },
        'wrap.addClipPoint': function (state, payload) {
            if (payload.index) {
                state.items[payload.id].points.splice(payload.index, 0, [payload.left, payload.top]);
            } else {
                state.items[payload.id].points.push([payload.left, payload.top]);
            }
            history.saveSnapshot();
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
        'itemContextMenu.open': function (state, payload) {
            payload.open = true;
            state.itemContextMenu = payload;
        },
        'itemContextMenu.close': function (state) {
            state.itemContextMenu = {
                id: null,
                top: 0,
                left: 0,
                open: false
            }
        },
        'itemContextMenu.openClipTool': function (state) {
            const id = state.itemContextMenu.id;
            Vue.set(state.items[id], 'cliptool', true);
        },
        'itemContextMenu.setRotation': function (state) {
            const id = state.itemContextMenu.id;
            const rotation = prompt("Please enter rotation:", state.items[id].rotate || 0);
            if (!(rotation == null || rotation === "" || isNaN(rotation))) {
                Vue.set(state.items[id], 'rotate', rotation);
            }
        },
        'itemContextMenu.setSize': function (state) {
            const id = state.itemContextMenu.id;
            let size = prompt("Please enter size (width x height):", `${state.items[id].width || 0} x ${state.items[id].height || 0}`);
            if (!(size == null || size === "")) {
                // parse
                size = size.match(/^(\d+)(?:px)?\s*[x,*]\s*(\d+)?(?:px)?\s*$/i);
                // set width
                if (size[1] && !isNaN(size[1])) Vue.set(state.items[id], 'width', parseInt(size[1]));
                // set height
                if (size[2] && !isNaN(size[2])) Vue.set(state.items[id], 'height', parseInt(size[2]));
            }
        },
        'itemContextMenu.setPosition': function (state) {
            const id = state.itemContextMenu.id;
            let size = prompt("Please enter position (left, top):", `${state.items[id].left || 0}, ${state.items[id].top || 0}`);
            if (!(size == null || size === "")) {
                // parse
                size = size.match(/^(\d+)(?:px)?\s*[x,*]\s*(\d+)?(?:px)?\s*$/i);
                // set width
                if (size[1] && !isNaN(size[1])) Vue.set(state.items[id], 'left', parseInt(size[1]));
                // set height
                if (size[2] && !isNaN(size[2])) Vue.set(state.items[id], 'top', parseInt(size[2]));
            }
        }
    }
});