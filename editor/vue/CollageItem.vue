<template>
    <div class="collage-item" :style="style" ref="item" :data-selected="item.selected" @contextmenu="openItemContextMenu">
        <div class="collage-item-wrap">
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
                return this.item.clip.map(x => x.join('%, ')).join('% ').trim();
            },
            style() {
                return {
                    width: this.item.width + 'px',
                    height: this.item.height + 'px',
                    top: this.item.y + 'px',
                    left: this.item.x + 'px',
                    clipPath: this.item.clip.length > 0 ? `polygon(${this.clipPath})` : 'none',
                    transform: `translateZ(${this.$store.state.zoom}px) rotate(${this.item.angle}deg)`,
                }
            },
            clip: {
                get () {
                    return this.$store.state.items[this.index].clip;
                },
                set (value) {
                    value.index = this.index;
                    this.$store.commit('item.clip', value);
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
            },
            openContextMenu(type, e) {
                e.preventDefault();
                if (this.item.state === null) {
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