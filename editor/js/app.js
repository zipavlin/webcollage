const app = new Vue({
    el: '#app',
    store,
    computed: {
        items() { return this.$store.state.items; },
        zoom() { return this.$store.state.zoom }
    },
    methods: {
        addNew () {

        },
        zoomIn () {
            this.$store.commit('setZoom', 'in');
        },
        zoomOut () {
            this.$store.commit('setZoom', 'out');
        }
    }
});