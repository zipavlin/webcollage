<template>
    <div class="collage-item" :style="style" :data-state="!item.state ? 'none' : item.state" ref="item" @contextmenu="openItemContextMenu">
        <div class="collage-item-wrap" :style="wrapStyle">
            <iframe class="collage-item-child" :src="item.url" frameborder="0" ref="child"></iframe>
            <mrr-tool v-if="item.state === 'child'" v-model="child" @changed="saveHistory" :options="{stroke: 'deeppink', action: false, rotate: false}" @contextmenu="openChildContextMenu"></mrr-tool>
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
                    width: this.item.childWidth + 'px',
                    height: this.item.childHeight + 'px',
                    top: this.item.childY + 'px',
                    left: this.item.childX + 'px',
                    clipPath: this.item.state !== 'clip' && this.item.state !== 'child' && this.item.clip.length > 2 ? `polygon(${this.clipPath})` : 'none',
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
            },
            child: {
                get () {
                    return {
                        width: this.$store.state.items[this.index].childWidth,
                        height: this.$store.state.items[this.index].childHeight,
                        x: this.$store.state.items[this.index].childX,
                        y: this.$store.state.items[this.index].childY
                    };
                },
                set (value) {
                    const obj = {
                        index: this.index,
                        childWidth: value.width,
                        childHeight: value.height,
                        childX: value.x,
                        childY: value.y,
                    };
                    this.$store.commit('item.mrr', obj);
                }
            },
        },
        created() {
            // init empty values
            this.$store.commit('item.setInitialState', this.index);
        },
        methods: {
            saveHistory() {
                history.saveSnapshot();
                this.$store.commit('stage.local.save');
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
            openChildContextMenu(e) {
                this.openContextMenu('child', e);
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
        &[data-state="none"] {
            overflow: hidden;
            &:hover {
                border-color: deeppink;
            }
        }
        &[data-state="child"], &[data-state="clip"] {
            &:after {
                content: '';
                position: absolute;
                display: block;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 2px solid rgb(0, 194, 255);
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                pointer-events: none;
            }
            .collage-item-wrap {
                overflow: visible;
            }
        }
        &-wrap {
            overflow: hidden;
            position: absolute;
            display: block;
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