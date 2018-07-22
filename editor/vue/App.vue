<template>
    <div id="app">
        <nav id="nav">
            <h1>Editor</h1>
            <div id="nav-wrap">
                <span>Zoom ({{zoom}}%)</span>
                <button id="zoom-out" @click="$store.commit('stage.zoomOut')" title="zoom out">-</button>
                <button id="zoom-in" @click="$store.commit('stage.zoomIn')" title="zoom in">+</button>
                <hr>
                <button id="add-new" @click="$store.dispatch('addNew')" title="add new component to collage">add new component</button>
                <hr>
                <button id="clear" @click="$store.commit('stage.clear')" title="clear collage">clear</button>
                <button id="export" @click="$store.commit('stage.export')" title="export collage">export</button>
                <button id="import" @click="$refs.fileInput.click()" title="import collage">import</button>
                <input type="file" ref="fileInput" accept="application/json" @change="importFile" style="display: none;" hidden>
            </div>
        </nav>
        <div id="stage">
            <collage-item v-for="(item ,i) of items" :key="i" :index="i" :item="item"></collage-item>
        </div>
        <context-menu v-if="contextMenu.type === 'item'" :left="contextMenu.left" :top="contextMenu.top" @close="$store.commit('contextMenu.close')">
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.item.openMrr')">edit size & position</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.item.openClip')">edit mask</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.item.openChild')">edit child</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.item.orderUp')">order up</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.item.orderDown')">order down</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.item.remove')">remove</button>
        </context-menu>
        <context-menu v-else-if="contextMenu.type === 'mrr'" :left="contextMenu.left" :top="contextMenu.top" @close="$store.commit('contextMenu.close')">
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.mrr.done')">done editing</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.mrr.setPosition')">set position</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.mrr.setSize')">set size</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.mrr.setRotation')">set rotation</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.mrr.fitToIntersection')">fit to intersection</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.mrr.fitToMask')">fit to mask</button>
        </context-menu>
        <context-menu v-else-if="contextMenu.type === 'clip'" :left="contextMenu.left" :top="contextMenu.top" @close="$store.commit('contextMenu.close')">
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.clip.done')">done editing</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.clip.clear')">clear mask</button>
        </context-menu>
        <context-menu v-else-if="contextMenu.type === 'child'" :left="contextMenu.left" :top="contextMenu.top" @close="$store.commit('contextMenu.close')">
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.child.done')">done editing</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.child.setPosition')">set position</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.child.setSize')">set size</button>
            <button class="blank context-menu-btn" @click="$store.commit('contextMenu.child.fitToFrame')">fit to frame</button>
        </context-menu>
    </div>
</template>

<script>
    import ContextMenu from './ContextMenu.vue';
    import CollageItem from './CollageItem.vue';

    export default {
        name: "App",
        components: {
            ContextMenu,
            CollageItem
        },
        computed: {
            items() { return this.$store.state.items; },
            zoom() { return this.$store.state.zoom },
            contextMenu() { return this.$store.state.contextMenu; }
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
            this.$store.commit('stage.local.load');
        },
        methods: {
            importFile(e) {
                const file = this.$refs.fileInput.files[0];
                if (!file || file.type !== 'application/json') {
                    alert("File doesn't exist or is not json type.");
                    return;
                }

                if (confirm(`are you sure you want to import file '${file.name}'? This will overwrite your locally saved collage.`)) {
                    // read file
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const result = JSON.parse(e.target.result);
                            if (!result) return new Error();
                            // save values
                            this.$store.commit('stage.import', result);
                        } catch (err) {
                            console.error(err);
                            alert("File count not be imported");
                        }
                    }.bind(this);
                    reader.readAsText(file, 'utf-8');
                }
            }
        }
    }
</script>

<style lang="scss">

</style>