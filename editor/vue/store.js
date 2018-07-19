import Vue from 'vue';
import Vuex from 'vuex';
import history from './history';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        items: [],
        zoom: 0,
        contextMenu: {
            id: null,
            type: null,
            top: 0,
            left: 0
        }
    },
    mutations: {
        'item.setInitialState': function (state, id) {
            const initialSettings = {
                width: window.innerWidth,
                height: window.innerHeight,
                x: 0,
                y: 0,
                clip: [],
                angle: 0,
                state: null
                //selected: false,
            };

            for (let key in initialSettings) {
                if (!state.items[id][key]) Vue.set(state.items[id], key, initialSettings[key]);
            }
        },
        'item.mrr': function (state, payload) {
            for (let key in payload) {
                if (key === 'index') continue;
                if (state.items[payload.index][key] === payload[key]) continue;
                state.items[payload.index][key] = payload[key];
            }
        },
        'item.clip': function (state, payload) {
            state.items[payload.index].clip = payload.clip;
        },

        // stage handlers
        'stage.zoomIn': function (state, action) {
            state.zoom += 100;
        },
        'stage.zoomOut': function (state, action) {
            state.zoom -= 100;
        },
        'stage.addNew': function (state) {
            const url = prompt("Write whole url in field below");
            if (url) {
                // check if url can be loaded
                // add url to stage.items
                state.items.push({url});
            }
        },
        'stage.clear': function (state) {
            if (confirm("Are you sure you want to clear collage. This will also remove it from your local storage")) {
                state.items = [];
            }
        },
        'stage.export': function (state) {
            state.zoom -= 100;
        },
        'stage.import': function (state) {
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

        'contextMenu.clip.done': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = null;
        },
        'contextMenu.clip.clear': function (state) {
            const id = state.contextMenu.id;
            state.items[id].clip = [];
        },

        'contextMenu.item.openMrr': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = 'mrr';
        },
        'contextMenu.item.openClip': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = 'clip';
        },
        'contextMenu.item.orderUp': function (state) {
            const id = state.contextMenu.id;
            const item = state.items.slice(id)[0];
            // remove item
            state.items.splice(id, 1);
            // add item back
            state.items.splice(id === state.items.length ? id : id + 1, 0, item);
        },
        'contextMenu.item.orderDown': function (state) {
            const id = state.contextMenu.id;
            const item = state.items.slice(id)[0];
            // remove item
            state.items.splice(id, 1);
            // add item back
            state.items.splice(id === 0 ? id : id - 1, 0, item);
        },


    }
});