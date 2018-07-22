import Vue from 'vue';
import Vuex from 'vuex';
import fileSaver from 'file-saver';
import history from './history';
import { resolve } from 'url';
import { clearTimeout } from 'timers';

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
                state: null,
                childWidth: window.innerWidth,
                childHeight: window.innerHeight,
                childX: 0,
                childY: 0
                //selected: false,
            };

            for (let key in initialSettings) {
                if (!state.items[id][key]) Vue.set(state.items[id], key, initialSettings[key]);
            }
        },
        'item.mrr': function (state, payload) {
            // change child size if this mutation is changing size
            if (state.items[payload.index].width !== payload.width && state.items[payload.index].width === state.items[payload.index].childWidth) state.items[payload.index].childWidth = payload.width;
            if (state.items[payload.index].height !== payload.height && state.items[payload.index].height === state.items[payload.index].childHeight) state.items[payload.index].childHeight = payload.height;

            // change other values
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
        'stage.addNew': function (state, url) {
            state.items.push({url});
        },
        'stage.clear': function (state) {
            if (confirm("Are you sure you want to clear collage. This will also remove it from your local storage")) {
                state.items = [];
            }
        },
        'stage.export': function (state) {
            if (state.items.length === 0) {
                alert("Your canvas is empty!");
            } else {
                const blob = new Blob([JSON.stringify(state.items)], {type: "application/json;charset=utf-8"});
                fileSaver.saveAs(blob, "web-collage.json");
            }
        },
        'stage.import': function (state, items) {
            state.items = items;
            localStorage.setItem('items', JSON.stringify(state.items));
        },
        'stage.local.save': function (state) {
            localStorage.setItem('items', JSON.stringify(state.items));
        },
        'stage.local.load': function (state) {
            const items = localStorage.getItem('items');
            if (!items) return;
            state.items = JSON.parse(items).map(item => {
                item.state = null;
                return item;
            });
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
        'contextMenu.mrr.fitToIntersection': function (state) {
            const id = state.contextMenu.id;
            const newWidth = Number(state.items[id].width - state.items[id].childX);
            const newHeight = Number(state.items[id].width - state.items[id].childX);
            const newX = Number(state.items[id].childX);
            const newY = Number(state.items[id].childY);
            state.items[id].width = newWidth;
            state.items[id].height = newHeight;
            state.items[id].x = state.items[id].x + (newX > 0 ? newX : 0);
            state.items[id].y = state.items[id].y + (newY > 0 ? newY : 0);
            state.items[id].childX = 0;
            state.items[id].childY = 0;
        },
        'contextMenu.mrr.fitToMask': function (state) {
            const id = state.contextMenu.id;
            if (state.items[id].clip.length <= 0) return;
            // get highest x, y & lowest x, y
            let top = state.items[id].height, right = 0, bottom = 0, left = state.items[id].width;
            state.items[id].clip.forEach(item => {
                // top
                if (item[1] < top) top = item[1];
                // right
                if (item[0] > right) right = item[0];
                // bottom
                if (item[1] > bottom) bottom = item[1];
                // left
                if (item[0] < left) left = item[0];
            });
            const padding = 10;
            top -= padding;
            right += padding;
            left -= padding;
            bottom += padding;

            // set new variables
            state.items[id].width = right - left;
            state.items[id].height = bottom - top;
            state.items[id].x = state.items[id].x + left;
            state.items[id].y = state.items[id].y + top;
            state.items[id].childX = state.items[id].childX - left;
            state.items[id].childY = state.items[id].childY - top;
        },

        'contextMenu.clip.done': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = null;
        },
        'contextMenu.clip.clear': function (state) {
            const id = state.contextMenu.id;
            state.items[id].clip = [];
        },

        'contextMenu.child.setPosition': function (state) {
            const id = state.contextMenu.id;
            let size = prompt("Please enter position (left, top):", `${state.items[id].childX || 0}, ${state.items[id].childY || 0}`);
            if (!(size == null || size === "")) {
                // parse
                size = size.match(/^(-?\d+)(?:px)?\s*[x,*]\s*(-?\d+)?(?:px)?\s*$/i);
                // set width
                if (size[1] && !isNaN(size[1])) state.items[id].childX = parseInt(size[1]);
                // set height
                if (size[2] && !isNaN(size[2])) state.items[id].childY = parseInt(size[2]);
            }
        },
        'contextMenu.child.setSize': function (state) {
            const id = state.contextMenu.id;
            let size = prompt("Please enter size (width x height):", `${state.items[id].childWidth || 0} x ${state.items[id].childHeight || 0}`);
            if (!(size == null || size === "")) {
                // parse
                size = size.match(/^(-?\d+)(?:px)?\s*[x,*]\s*(-?\d+)?(?:px)?\s*$/i);
                // set width
                if (size[1] && !isNaN(size[1])) state.items[id].childWidth = parseInt(size[1]);
                // set height
                if (size[2] && !isNaN(size[2])) state.items[id].childHeight = parseInt(size[2]);
            }
        },
        'contextMenu.child.done': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = null;
        },
        'contextMenu.child.fitToFrame': function (state) {
            const id = state.contextMenu.id;
            state.items[id].childWidth = state.items[id].width;
            state.items[id].childHeight = state.items[id].height;
            state.items[id].childX = 0;
            state.items[id].childY = 0;
        },

        'contextMenu.item.openMrr': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = 'mrr';
        },
        'contextMenu.item.openClip': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = 'clip';
        },
        'contextMenu.item.openChild': function (state) {
            const id = state.contextMenu.id;
            state.items[id].state = 'child';
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
        'contextMenu.item.remove': function (state) {
            const id = state.contextMenu.id;
            // remove item
            state.items.splice(id, 1);
        },
    },
    actions: {
        addNew({ commit }) {
            const url = prompt("Write url in field below");
            if (url) {
                commit('stage.addNew', url); 
                /*
                // check head
                const http = new XMLHttpRequest();
                let hasError = false;
                http.open('HEAD', url);
                http.onabort = function() {
                    console.log('abort');
                };
                http.onerror = function() {
                    console.log('error');
                    hasError = true;
                };
                http.onloadend = function() {
                    console.log(http.getAllResponseHeaders());
                    console.log(http.response);
                    
                    if (!hasError) commit('stage.addNew', url);                    
                    else alert("Website cannot be loaded in iframe");
                };
                http.send();
                */
            }
        }
    }
});