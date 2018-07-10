<template>
    <div class="collage-item" :style="style" ref="wrap" :data-selected="item.selected" @contextmenu="openContextMenu">
        <iframe class="collage-item-child" :src="item.url" frameborder="0" ref="child"></iframe>
        <clip-tool v-if="item.cliptool" :item-id="index" :width="item.width" :height="item.height" :points="item.points || []"></clip-tool>
    </div>
</template>

<script>
    import ClipTool from './ClipTool.vue';
    import interact from 'interactjs';

    export default {
        name: "CollageItem",
        components: {
            ClipTool
        },
        props: ['item', 'index'],
        data() {
            return {
                editWrap: false,
                editChild: false,
                showClipTool: false,
                interacts: []
            }
        },
        computed: {
            style() {
                return {
                    width: this.item.width + 'px',
                    height: this.item.height + 'px',
                    top: this.item.top + 'px',
                    left: this.item.left + 'px',
                    clipPath: this.item.clip ? `polygon(${this.item.clip})` : 'none',
                    transform: `translateZ(${this.$store.state.zoom}px) rotate(${this.item.rotate ? this.item.rotate : 0}deg)`,
                }
            }
        },
        watch: {
            item() {
                if (this.item.cliptool && this.interacts.length > 0) {
                    this.unsetInteracts();
                } else if (!this.item.cliptool && this.interacts.length < 0) {
                    this.setInteracts();
                }
            }
        },
        created() {
            // init empty values
            this.$store.commit('wrap.setInitialState', this.index);
        },
        mounted() {
            // set interacts
            this.setInteracts();
        },
        beforeDestroy() {
            this.unsetInteracts();
        },
        methods: {
            openContextMenu(e) {
                e.preventDefault();
                this.$store.commit('itemContextMenu.open', {
                    id: this.index,
                    left: e.clientX,
                    top: e.clientY
                });
            },
            setInteracts() {
                const wrap_moveresize = interact(this.$refs.wrap)
                    .draggable({})
                    .resizable({
                        edges: { left: true, right: true, bottom: true, top: true },
                        restrictSize: {
                            min: { width: 50, height: 50 },
                        },
                        inertia: true,
                    })
                    .on('dragstart resizestart', function () {
                        this.$store.commit('wrap.select', this.index);
                    }.bind(this))
                    .on('dragend resizeend', function () {
                        this.$store.commit('wrap.unselect', this.index);
                    }.bind(this))
                    .on('dragmove', function (event) {
                        this.$store.commit('wrap.moveresize', {
                            id: this.index,
                            left: event.dx,
                            top: event.dy
                        });
                    }.bind(this))
                    .on('resizemove', function (event) {
                        this.$store.commit('wrap.moveresize', {
                            id: this.index,
                            width: event.rect.width,
                            height: event.rect.height,
                            left: event.deltaRect.left,
                            top: event.deltaRect.top
                        });
                    }.bind(this));
                this.interacts.push(wrap_moveresize);
            },
            unsetInteracts() {
                this.interacts.forEach(int => int.unset());
                // empty array
                this.interacts = [];
            }
        }
    }
</script>

<style scoped lang="scss">
    .collage-item {
        position: absolute;
        display: block;
        overflow: hidden;
        border: 1px dotted transparent;
        &:hover, &[data-selected="true"] {
            border-color: #b8b7b7;
            .collage-item-nav {
                opacity: 1;
            }
        }
        &-child {
            position: absolute;
            display: block;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        &-nav {
            position: absolute;
            display: flex;
            top: 50%;
            left: 50%;
            transform: translate3d(-50%, -50%, 0);
            opacity: 0;
            transition: opacity .35s;
            z-index: 2;
            &-btn {
                $size: 36px;
                position: relative;
                width: $size;
                height: $size;
                background-color: #fff;
                border: 2px solid #0d121d;
                border-radius: 50%;
                outline: none;
                flex: none;
                margin: 0 3px;
                cursor: pointer;
                svg {
                    $size: 18px;
                    position: absolute;
                    display: block;
                    width: $size;
                    height: $size;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
    }
</style>