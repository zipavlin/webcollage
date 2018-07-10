<template>
    <div :class="className" :style="style" ref="mrr" :data-corner="corner" @contextmenu="onContextMenu" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <slot></slot>
    </div>
</template>

<script>
    import interact from 'interactjs';

    export default {
        name: "MoveResizeRotate",
        props: ['name', 'x', 'y', 'width', 'height', 'rotation', 'clipPoints', 'zoom', 'hasContextMenu'],
        data() {
            return {
                corner: null,
                selected: false,
                interact: null,
                intX: this.x || 0,
                intY: this.y || 0,
                intWidth: this.width || window.innerWidth,
                intHeight: this.height || window.innerHeight,
                intRotation: this.rotation || 0,
                intScaleX: this.scaleX || 1,
                intScaleY: this.scaleY || 1,
                intClipPoints: this.clipPoints || [],
            }
        },

        computed: {
            style() {
                return {
                    width: this.intWidth + 'px',
                    height: this.intHeight + 'px',
                    top: this.intY + 'px',
                    left: this.intX + 'px',
                    transform: `translateZ(${this.zoom || 0}px) rotate(${this.intRotation || 0}deg)`,
                    clipPath: this.intClipPoints.length > 0 ? `polygon(${this.intClipPoints.map(x => x.join('px ')).join('px, ')})` : `none`
                };
            },
            className() {
                let className = ['mrr-item'];
                if (this.selected) className.push('hover');
                return className.join(' ');
            }
        },
        created() { this.$emit('created'); },
        mounted() {
            // set interacts
            this._setInteracts();
            this.$emit('mounted');
        },
        beforeDestroy() {
            this._unsetInteracts();
            this.$emit('beforeDestroy');
        },
        methods: {
            _setInteracts() {
                // set up interact for move, resize & rotate
                const int = interact(this.$refs.mrr);
                int.draggable({
                    ignoreFrom: '.mrr-item-rotate',
                    onstart: function () {
                        this.onHoverStart();
                    }.bind(this),
                    onend: function () {
                        this.onHoverEnd();
                        this.onMoveEnd();
                    }.bind(this),
                    onmove: function (e) {
                        if (this.corner !== null) {
                            // calculate angle
                            // set rotation
                        } else {
                            this.onMove({
                                x: (this.intX || 0) + e.dx,
                                y: (this.intY || 0) + e.dy
                            });
                        }
                    }.bind(this)
                });
                int.resizable({
                    ignoreFrom: '.mrr-item-rotate',
                    edges: { left: true, right: true, bottom: true, top: true },
                    restrictSize: {
                        min: { width: 10, height: 10 },
                    },
                    inertia: true,
                    onstart: function () {
                        this.onHoverStart();
                    }.bind(this),
                    onend: function () {
                        this.onHoverEnd();
                        this.onResizeEnd();
                    }.bind(this),
                    onmove: function (e) {
                        this.onResize({
                            width: e.rect.width,
                            height: e.rect.height,
                            x: (this.intX || 0) + e.deltaRect.left,
                            y: (this.intY || 0) + e.deltaRect.top
                        });
                    }.bind(this)
                });

                this.interact = int;
            },
            _unsetInteracts() {
                this.interact.unset();
                this.interact = null;
            },
            
            onMouseEnter(e) {
                window.addEventListener('mousemove', this.onMouseMove);
            },
            onMouseLeave(e) {
                window.removeEventListener('mousemove', this.onMouseMove);
            },
            onMouseMove(e) {
                const d = 20;
                const a = 20;
                // check if mouse is in the corner
                const x = e.layerX;
                const y = e.layerY;
                let corner;
                if (x > d && x < d + a && y > d && y < d + a) {
                    corner = 'top_left';
                } else if (x > this.intWidth - (d + a) && x < this.intWidth - d && y > d && y < d + a) {
                    corner = 'top_right';
                } else if (x > d && x < d + a && y > this.intHeight - (d + a) && y < this.intHeight - d) {
                    corner = 'bottom_left';
                } else if (x > this.intWidth - (d + a) && x < this.intWidth - d && y > this.intHeight - (d + a) && y < this.intHeight - d) {
                    corner = 'bottom_right';
                } else {
                    corner = null;
                }
                // save to data
                if (this.corner !== corner) {
                    this.corner = corner;
                }
            },

            onContextMenu(e) {
                if (this.hasContextMenu) {
                    e.preventDefault();
                    this.$emit('contextmenu');
                }
            },

            onMove(payload) {
                payload.name = this.name;
                this.intX = payload.x;
                this.intY = payload.y;
                this.$emit('move', payload);
            },
            onMoveEnd() {
                this.$emit('moveEnd', {
                    name: this.name,
                    x: this.intX,
                    y: this.intY
                });
            },
            onResize(payload) {
                payload.name = this.name;
                this.intX = payload.x;
                this.intY = payload.y;
                this.intWidth = payload.width;
                this.intHeight = payload.height;
                this.$emit('resize', payload);
            },
            onResizeEnd() {
                this.$emit('resizeEnd', {
                    name: this.name,
                    x: this.intX,
                    y: this.intY,
                    width: this.intWidth,
                    height: this.intHeight
                });
            },
            onRotate(payload) {
                payload.name = this.name;
                this.intRotation = payload.rotation;
                this.$emit('rotate', payload);
            },
            onRotateEnd() {
                this.$emit('rotateEnd', {
                    name: this.name,
                    rotation: this.intRotation
                });
            },
            onScale(payload) {},
            onScaleEnd(payload) {},
            onClip(payload) {},
            onClipEnd(payload) {},

            onTrimEnd() {},

            onHoverStart() {
                this.selected = true;
                this.$emit('hoverStart', this.name);
            },
            onHoverEnd() {
                this.selected = false;
                this.$emit('hoverEnd', this.name);
            }
        }
    }
</script>

<style scoped lang="scss">
    $size: 30px;
    $distance: 20px;
    .mrr-item {
        position: absolute;
        display: block;
        overflow: hidden;
        border: 1px dotted transparent;
        &:hover, .hover {
            border-color: #b8b7b7;
            & *:not(.mrr-item-rotate) {
                pointer-events: none;
            }
        }
        &[data-corner]:after {
            content: '';
            position: absolute;
            display: block;
            width: $size;
            height: $size;
            transition: opacity .25s;
            background-size: $size;
            background-position: center center;
            background-repeat: no-repeat;
            background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTguODg1IDMuNTE1Yy00LjYxNy00LjYxOC0xMi4wNTYtNC42NzYtMTYuNzU2LS4xOTVsLTIuMTI5LTIuMjU4djcuOTM4aDcuNDg0bC0yLjA2Ni0yLjE5MWMyLjgyLTIuNzA2IDcuMjk3LTIuNjc2IDEwLjA3My4xIDQuMzQxIDQuMzQxIDEuNzM3IDEyLjI5MS01LjQ5MSAxMi4yOTF2NC44YzMuNzA4IDAgNi42MTQtMS4yNDQgOC44ODUtMy41MTUgNC42ODYtNC42ODYgNC42ODYtMTIuMjg0IDAtMTYuOTd6Ii8+PC9zdmc+);
        }
        &[data-corner="top_left"]:after {
            top: $distance;
            left: $distance;
        }
        &[data-corner="top_right"]:after {
            top: $distance;
            right: $distance;
        }
        &[data-corner="bottom_left"]:after {
            left: $distance;
            bottom: $distance;
        }
        &[data-corner="bottom_right"]:after {
            right: $distance;
            bottom: $distance;
        }
    }
</style>