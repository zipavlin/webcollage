<template>
    <div id="app">
        <nav id="nav">
            <h1>Editor</h1>
            <div id="nav-wrap">
                <span>Zoom ({{zoom}}%)</span>
                <button id="zoom-out" @click="$store.commit('stage.zoomOut')" title="zoom out">-</button>
                <button id="zoom-in" @click="$store.commit('stage.zoomIn')" title="zoom in">+</button>
                <hr>
                <button id="add-new" @click="$store.commit('stage.addNew')" title="add new component to collage">add new component</button>
            </div>
        </nav>
        <div id="stage">
            <move-resize-rotate>
                <h1>Hello world</h1>
            </move-resize-rotate>
        </div>
        <!--
        <div id="stage">
            <collage-item v-for="(item ,i) of items" :key="i" :index="i" :item="item"></collage-item>
        </div>
        -->
        <context-menu v-if="itemContextMenu.open" :left="itemContextMenu.left" :top="itemContextMenu.top" @close="$store.commit('itemContextMenu.close')">
            <button class="blank context-menu-btn" @click="$store.commit('itemContextMenu.openClipTool')">open clip tool</button>
            <button class="blank context-menu-btn" @click="$store.commit('itemContextMenu.setRotation')">set rotation</button>
            <button class="blank context-menu-btn" @click="$store.commit('itemContextMenu.setSize')">set size</button>
            <button class="blank context-menu-btn" @click="$store.commit('itemContextMenu.setPosition')">set position</button>
            <button class="blank context-menu-btn" @click="">edit child object</button>
        </context-menu>
    </div>
</template>

<script>
    import ContextMenu from './ContextMenu.vue';
    import CollageItem from './CollageItem.vue';
    import MoveResizeRotate from './MoveResizeRotate.vue';
    import history from './history';

    export default {
        name: "App",
        components: {
            ContextMenu,
            CollageItem,
            MoveResizeRotate
        },
        computed: {
            items() { return this.$store.state.items; },
            zoom() { return this.$store.state.zoom },
            itemContextMenu() { return this.$store.state.itemContextMenu; }
        },
        mounted() {
            // add history key listeners
            window.addEventListener('keydown', function (e) {
                if (e.ctrlKey && e.key === 'z' && history.canUndo) {
                    e.preventDefault();
                    history.undo();
                }
                else if (e.ctrlKey && e.key === 'y' && history.canRedo) {
                    e.preventDefault();
                    history.redo();
                }
            }.bind(this));
        }
    }
</script>

<style lang="scss">

</style>