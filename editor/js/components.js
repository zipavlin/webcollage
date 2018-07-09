// context menu
Vue.component('item-context-menu', {
    props: ['left', 'top'],
    computed: {
        style() {
            return {
                left: this.left + 'px',
                top: this.top + 'px'
            }
        }
    },
    mounted() {
        window.addEventListener('click', this.closeContextMenu);
    },
    beforeDestroy() {
        window.removeEventListener('click', this.closeContextMenu);
    },
    methods: {
        closeContextMenu() {
            this.$store.commit('itemContextMenu.close');
        },
        openClipTool() {},
        setRotation() {

        },
        setSize() {},
        setPosition() {},
        editChild() {}
    },
    template: `<div class="context-menu" :style="style">
        <button class="blank context-menu-btn" @click="$store.commit('itemContextMenu.openClipTool')">open clip tool</button>
        <button class="blank context-menu-btn" @click="$store.commit('itemContextMenu.setRotation')">set rotation</button>
        <button class="blank context-menu-btn" @click="$store.commit('itemContextMenu.setSize')">set size</button>
        <button class="blank context-menu-btn" @click="$store.commit('itemContextMenu.setPosition')">set position</button>
        <button class="blank context-menu-btn" @click="">edit child object</button>
    </div>`
});

// cliping tool
Vue.component('clip-tool', {
    props: ['width', 'height', 'itemId', 'points'],
    data() {
        return {
            pathHover: false
        }
    },
    computed: {
        viewbox() {
            return `0 0 ${this.width} ${this.height}`;
        },
        path() {
            return this.points.map(x => x.join(',')).join(' ');
        }
    },
    methods: {
        addPoint(e) {
            // create click point
            let clickPoint = this.$refs.SVG.createSVGPoint();
            clickPoint.x = e.layerX;
            clickPoint.y = e.layerY;
            // check if target is polygon
            if (this.$refs.polygon && this.$refs.polygon.isPointInStroke(clickPoint)) {
                console.log('on path');
                // find point before
                // add point there
            } else {
                this.$store.commit('wrap.addClipPoint', {
                    id: this.itemId,
                    left: e.layerX,
                    top: e.layerY
                });
            }
        },
        setPathHover() {this.pathHover = true; },
        setPathNormal() {this.pathHover = false; }
    },
    template: `<svg ref="SVG" class="clip-tool" :width="width || '100%'" :height="height || '100%'" :viewBox="viewbox" :data-path-hover="pathHover" @click="addPoint">
        <polygon v-if="points.length > 0" :points="path" ref="polygon" @mouseenter="setPathHover" @mouseleave="setPathNormal"></polygon>
        <circle v-for="(point, i) of points" :key="i" :index="i" :cx="point[0]" :cy="point[1]" r="2" />
    </svg>`
});

// collage item
Vue.component('collage-item', {
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
    },
    template: `<a class="collage-item" :style="style" ref="wrap" :data-selected="item.selected" @contextmenu="openContextMenu">
        <iframe class="collage-item-child" :src="item.url" frameborder="0" ref="child"></iframe>
        <clip-tool v-if="item.cliptool" :item-id="index" :width="item.width" :height="item.height" :points="item.points || []"></clip-tool>
    </a>`
});