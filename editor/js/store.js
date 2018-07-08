const store = new Vuex.Store({
   state: {
       items: [
           {url: 'http://www.espn.com/espn/feature/story/_/id/23851669/espn-body-issue-2018'}
       ],
       zoom: 0
   },
    mutations: {
        // collage item wrap handlers
        moveresize (state, payload) {
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
        select (state, id) {
            Vue.set(state.items[id], 'selected', true);
        },
        unselect (state, id) {
            Vue.set(state.items[id], 'selected', false);
        },
        resetrotation (state, id) {
            Vue.set(state.items[id], 'rotate', 0);
        },
        // collage item child handlers

        // collage stage handlers
        setZoom (state, action) {
            if (action === 'in') {
                state.zoom += 100;
            } else if (action === 'out') {
                state.zoom -= 100;
            }
        }
    }
});