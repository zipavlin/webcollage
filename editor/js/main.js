// components
Vue.component('collage-clip', {
    props: ['width', 'height', 'clip'],
    template: `<svg :width="width" :height="height" viewBox="0 0 ${width} ${height}">
        <polygon :points="clip"></polygon>
    </svg>`
});
Vue.component('collage-item', {
    props: ['item', 'index'],
    data() {
        return {
            editWrap: false,
            editChild: false
        }
    },
    computed: {
        style() {
            return {
                width: (this.item.width ? this.item.width : 200) + 'px',
                height: (this.item.height ? this.item.height : 100) + 'px',
                top: (this.item.top ? this.item.top : 0) + 'px',
                left: (this.item.left ? this.item.left : 0) + 'px',
                clipPath: this.item.clip ? `polygon(${this.item.clip})` : 'none',
                transform: `rotate(${this.item.rotate ? this.item.rotate : 0}deg)`,
            }
        }
    },
    mounted() {
        // move, resize wrap
        interact(this.$refs.wrap)
            .draggable({
                ignoreFrom: '.collage-item-nav-btn'
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                restrictSize: {
                    min: { width: 50, height: 50 },
                },
                inertia: true,
            })
            .on('dragstart resizestart', function () {
                this.$store.commit('select', this.index);
            }.bind(this))
            .on('dragend resizeend', function () {
                this.$store.commit('unselect', this.index);
            }.bind(this))
            .on('dragmove', function (event) {
                this.$store.commit('moveresize', {
                    id: this.index,
                    left: event.dx,
                    top: event.dy
                });
            }.bind(this))
            .on('resizemove', function (event) {
                this.$store.commit('moveresize', {
                    id: this.index,
                    width: event.rect.width,
                    height: event.rect.height,
                    left: event.deltaRect.left,
                    top: event.deltaRect.top
                });
            }.bind(this));
        // rotate wrap
        interact(this.$refs.rotate)
            .draggable({})
            .on('dragmove', function (event) {
                let amount = (Math.abs(event.dx) > Math.abs(event.dy)) ? event.dx : event.dy;
                this.$store.commit('moveresize', {
                    id: this.index,
                    rotate: amount,
                });
            }.bind(this))
    },
    methods: {
        resetRotation() {
            console.log('bla');
            this.$store.commit('resetrotation', this.index);
        }
    },
    template: `<a class="collage-item" :style="style" ref="wrap" :data-selected="item.selected">
        <iframe class="collage-item-child" :src="item.url" frameborder="0" ref="child"></iframe>
        <nav class="collage-item-nav" ref="nav">
            <button class="blank collage-item-nav-btn" ref="reset" @click="resetRotation">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z"/></svg>
            </button>
            <button class="blank collage-item-nav-btn" ref="rotate">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M18.885 3.515c-4.617-4.618-12.056-4.676-16.756-.195l-2.129-2.258v7.938h7.484l-2.066-2.191c2.82-2.706 7.297-2.676 10.073.1 4.341 4.341 1.737 12.291-5.491 12.291v4.8c3.708 0 6.614-1.244 8.885-3.515 4.686-4.686 4.686-12.284 0-16.97z"/></svg>
            </button>
            <button class="blank collage-item-nav-btn" ref="clip">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.769 9.923l-12.642 12.639-7.127 1.438 1.438-7.128 12.641-12.64 5.69 5.691zm1.414-1.414l2.817-2.82-5.691-5.689-2.816 2.817 5.69 5.692z"/></svg>
            </button>
        </nav>
    </a>`
});

// store
const store = new Vuex.Store({
   state: {
       items: [
           {url: 'http://www.espn.com/espn/feature/story/_/id/23851669/espn-body-issue-2018'}
       ]
   },
    mutations: {
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
    }
});

// app
const app = new Vue({
    el: '#app',
    store,
    computed: {
        items() { return this.$store.state.items; }
    },
    methods: {
        addNew: function () {

        }
    }
});