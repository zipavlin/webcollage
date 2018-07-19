<template>
    <div class="collage-item" :style="style" ref="item" :data-can-edit="!item.state" @contextmenu="openItemContextMenu">
        <div class="collage-item-wrap" :style="wrapStyle">
            <iframe class="collage-item-child" :src="item.url" frameborder="0" ref="child"></iframe>
        </div>
        <mrr-tool v-if="item.state === 'mrr'" v-model="mrr" @changed="saveHistory" :options="{action: false}" @contextmenu="openMrrContextMenu"></mrr-tool>
        <clip-tool v-else-if="item.state === 'clip'" v-model="clip" :width="item.width" :height="item.height" @changed="saveHistory" @contextmenu="openClipContextMenu"></clip-tool>
    </div>
</template>

<script>
    import MrrTool from '@zipavlin/vue-mrr-tool';
    import ClipTool from '@zipavlin/vue-clip-tool';
    import history from './history';

    export default {
        name: "CollageItem",
        components: {
            ClipTool,
            MrrTool
        },
        props: ['item', 'index'],
        data() {
            return {
                editWrap: false,
                editChild: false,
            }
        },
        computed: {
            clipPath() {
                return this.item.clip.map(x => x.map(z => z + 'px').join(' ')).join(',').trim();
            },
            style() {
                return {
                    width: this.item.width + 'px',
                    height: this.item.height + 'px',
                    top: this.item.y + 'px',
                    left: this.item.x + 'px',
                    transform: `translateZ(${this.$store.state.zoom}px) rotate(${this.item.angle}deg)`,
                }
            },
            wrapStyle() {
                return {
                    clipPath: this.item.state !== 'clip' && this.item.clip.length > 2 ? `polygon(${this.clipPath})` : 'none',
                }
            },
            clip: {
                get () {
                    return this.$store.state.items[this.index].clip;
                },
                set (value) {
                    this.$store.commit('item.clip', {
                        clip: value,
                        index: this.index
                    });
                }
            },
            mrr: {
                get () {
                    return {
                        width: this.$store.state.items[this.index].width,
                        height: this.$store.state.items[this.index].height,
                        x: this.$store.state.items[this.index].x,
                        y: this.$store.state.items[this.index].y,
                        angle: this.$store.state.items[this.index].angle,
                    };
                },
                set (value) {
                    value.index = this.index;
                    this.$store.commit('item.mrr', value);
                }
            }
        },
        created() {
            // init empty values
            this.$store.commit('item.setInitialState', this.index);
        },
        methods: {
            saveHistory() {
                history.saveSnapshot();
                // save state.items to local storage
            },
            openContextMenu(type, e) {
                e.preventDefault();
                if (this.item.state === type || type === 'item' && this.item.state === null) {
                    this.$store.commit('contextMenu.open', {
                        id: this.index,
                        type: type,
                        left: e.clientX,
                        top: e.clientY
                    });
                }
            },
            openMrrContextMenu(e) {
                this.openContextMenu('mrr', e);
            },
            openClipContextMenu(e) {
                this.openContextMenu('clip', e);
            },
            openItemContextMenu(e) {
                this.openContextMenu('item', e);
            }
        }
    }
</script>

<style scoped lang="scss">
    .collage-item {
        position: absolute;
        display: block;
        border: 2px solid transparent;
        transition: border-color .25s;
        &[data-can-edit="true"]:hover {
            border-color: deeppink;
        }
        &-wrap {
            overflow: hidden;
        }
        &-child {
            position: absolute;
            display: block;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
    }
</style>