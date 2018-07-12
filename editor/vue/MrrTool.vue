<template>
    <svg class="mrr-tool" ref="mrr" :width="wrapSize" :height="wrapSize" :viewBox="viewBox" :style="style">
        <!-- rotate guide -->
        <circle class="mrr-tool-rotate guide" v-if="!isMobile" :cx="outerRadius" :cy="outerRadius" :r="outerRadius" :data-hover="rotation"></circle>
        <!-- move handle -->
        <rect class="mrr-tool-move" ref="move" :x="paddingLeft" :y="paddingTop" :width="value.width" :height="value.height"></rect>
        <!-- resize handles -->
        <g class="mrr-tool-resize-handles" v-if="!isMobile">
            <rect class="mrr-tool-resize resize-diagonal nwse top-left" :x="paddingLeft - (settings.resizeSize / 2)" :y="paddingTop - (settings.resizeSize / 2)" :width="settings.resizeSize" :height="settings.resizeSize" :fill="settings.fill" ref="resizeTopLeft"></rect>
            <rect class="mrr-tool-resize resize-vertical top" :x="paddingLeft + (value.width / 2) - (settings.resizeSize / 2)" :y="paddingTop - (settings.resizeSize / 2)" :width="settings.resizeSize" :height="settings.resizeSize" :fill="settings.fill" ref="resizeTop"></rect>
            <rect class="mrr-tool-resize resize-diagonal nesw top-right" :x="paddingLeft + value.width - (settings.resizeSize / 2)" :y="paddingTop - (settings.resizeSize / 2)" :width="settings.resizeSize" :height="settings.resizeSize" :fill="settings.fill" ref="resizeTopRight"></rect>
            <rect class="mrr-tool-resize resize-horizontal right" :x="paddingLeft + value.width - (settings.resizeSize / 2)" :y="paddingTop + (value.height / 2) - (settings.resizeSize / 2)" :width="settings.resizeSize" :height="settings.resizeSize" :fill="settings.fill" ref="resizeRight"></rect>
            <rect class="mrr-tool-resize resize-diagonal nwse bottom-right" :x="paddingLeft + value.width - (settings.resizeSize / 2)" :y="paddingTop + value.height - (settings.resizeSize / 2)" :width="settings.resizeSize" :height="settings.resizeSize" :fill="settings.fill" ref="resizeBottomRight"></rect>
            <rect class="mrr-tool-resize resize-vertical bottom" :x="paddingLeft + (value.width / 2) - (settings.resizeSize / 2)" :y="paddingTop + value.height - (settings.resizeSize / 2)" :width="settings.resizeSize" :height="settings.resizeSize" :fill="settings.fill" ref="resizeBottom"></rect>
            <rect class="mrr-tool-resize resize-diagonal nesw bottom-left" :x="paddingLeft - (settings.resizeSize / 2)" :y="paddingTop + value.height - (settings.resizeSize / 2)" :width="settings.resizeSize" :height="settings.resizeSize" :fill="settings.fill" ref="resizeBottomLeft"></rect>
            <rect class="mrr-tool-resize resize-horizontal left" :x="paddingLeft - (settings.resizeSize / 2)" :y="paddingTop + (value.height / 2) - (settings.resizeSize / 2)" :width="settings.resizeSize" :height="settings.resizeSize" :fill="settings.fill" ref="resizeLeft"></rect>
        </g>
        <!-- rotate handles -->
        <g class="mrr-tool-rotate-handles" v-if="!isMobile">
            <circle class="mrr-tool-rotate nesw top-left" :cx="paddingLeft - settings.padding + settings.rotateSize - settings.strokeWidth" :cy="paddingTop - settings.padding + settings.rotateSize + settings.strokeWidth" :r="settings.rotateSize" :fill="settings.fill" ref="rotateTopLeft"></circle>
            <circle class="mrr-tool-rotate nwse top-right" :cx="(paddingLeft + value.width) + settings.padding - settings.rotateSize - (settings.strokeWidth / 2)" :cy="paddingTop - settings.padding + settings.rotateSize + (settings.strokeWidth / 2)" :r="settings.rotateSize" :fill="settings.fill" ref="rotateTopRight"></circle>
            <circle class="mrr-tool-rotate nesw bottom-right" :cx="(paddingLeft + value.width) + settings.padding - (settings.rotateSize + settings.strokeWidth)" :cy="(paddingTop + value.height) + settings.padding - (settings.rotateSize + settings.strokeWidth)" :r="settings.rotateSize" :fill="settings.fill" ref="rotateBottomRight"></circle>
            <circle class="mrr-tool-rotate nwse bottom-left" :cx="paddingLeft - settings.padding + (settings.rotateSize + (settings.strokeWidth / 2))" :cy="(paddingTop + value.height) + settings.padding - (settings.rotateSize + (settings.strokeWidth / 2))" :r="settings.rotateSize" :fill="settings.fill" ref="rotateBottomLeft"></circle>
        </g>
    </svg>
</template>

<script>
    import hammer from 'hammerjs';

    const _getAngle = (e, rect) => {
        const center = [
            rect.left + (rect.width / 2), // rect.left + (rect.right - rect.left) / 2
            rect.top + (rect.height / 2)
        ];
        return Math.atan2(e.clientY - center[1], e.clientX - center[0]) * 180 / Math.PI + 180;
    };

    export default {
        name: 'MRRTool',
        props: {
            value: {
                default: () => ({
                    width: 200,
                    height: 200,
                    x: 0,
                    y: 0,
                    angle: 0
                }),
                type: Object
            },
            settings: {
                default: () => ({
                    padding: 26,
                    stroke: '#00E7FF',
                    strokeWidth: 2,
                    fill: 'white',
                    resizeSize: 10,
                    rotateSize: 6
                }),
                type: Object
            }
        },
        data() {
            return {
                prevAngle: 0,
                handleAngle: 0,
                rotation: false,
                managers: {
                    pan: []
                },
                isMobile: (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4)))
            }
        },
        computed: {
            // paddingLeft - (settings.padding + settings.rotateSize + (settings.strokeWidth / 2))
            outerRadius() {
                const width = ((this.value.width / 2) + this.settings.padding - (this.settings.rotateSize + (this.settings.strokeWidth / 2)));
                const height = ((this.value.height / 2) + this.settings.padding - (this.settings.rotateSize + (this.settings.strokeWidth / 2)));
                return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
            },
            wrapSize() {
                return (this.outerRadius * 2) + (this.settings.strokeWidth);
            },
            paddingLeft() {
                return ((this.wrapSize - this.value.width) / 2);
            },
            paddingTop() {
                return ((this.wrapSize - this.value.height) / 2);
            },
            viewBox() {
                return `0 0 ${this.wrapSize}, ${this.wrapSize}`;
            },
            style() {
                return {
                    top: `-${this.paddingTop}px`,
                    left: `-${this.paddingLeft}px`,
                    stroke: this.settings.stroke,
                    strokeWidth: `${this.settings.strokeWidth}px`,
                    fill: 'transparent'
                }
            }
        },
        mounted() {
            if (!this.isMobile) {
                // add resize listeners
                this._registerPanListener(this.$refs.resizeTopLeft,     {width: true,   height: true,   x: true,    y: true,    angle: false}, {invertX: true,  invertY: true});
                this._registerPanListener(this.$refs.resizeTop,         {width: false,  height: true,   x: false,   y: true,    angle: false}, {invertX: false, invertY: true});
                this._registerPanListener(this.$refs.resizeTopRight,    {width: true,   height: true,   x: false,   y: true,    angle: false}, {invertX: false, invertY: true});
                this._registerPanListener(this.$refs.resizeRight,       {width: true,   height: false,  x: false,   y: false,   angle: false}, {invertX: false, invertY: false});
                this._registerPanListener(this.$refs.resizeBottomRight, {width: true,   height: true,   x: false,   y: false,   angle: false}, {invertX: false, invertY: false});
                this._registerPanListener(this.$refs.resizeBottom,      {width: false,  height: true,   x: false,   y: false,   angle: false}, {invertX: false, invertY: false});
                this._registerPanListener(this.$refs.resizeBottomLeft,  {width: true,   height: true,   x: true,    y: false,   angle: false}, {invertX: true,  invertY: false});
                this._registerPanListener(this.$refs.resizeLeft,        {width: true,   height: false,  x: true,    y: false,   angle: false}, {invertX: true,  invertY: false});
                // add rotate listener
                this._registerPanListener(this.$refs.rotateTopLeft,     {width: false,  height: false,  x: false,   y: false,   angle: true}, {start: this._rotateStart(), end: this._rotateEnd()});
            }
            // add move listener
            this._registerPanListener(this.$refs.move, {width: false, height: false, x: true, y: true, angle: false}, {invertX: false, invertY: false});
        },
        beforeDestroy() {
            // remove listeners
            this.managers.pan.forEach(m => this._removePanListener(m));
        },
        methods: {
            _registerPanListener(element, changes, settings) {
                // create hammer manager
                const manager = new Hammer.Manager(element, {recognizers: [[Hammer.Pan]]});
                // register event listeners
                manager.on('panstart', function (e) {
                    this.prevAngle = 0;
                    if (changes.angle) {
                        this.handleAngle = _getAngle(e.srcEvent, this.$refs.mrr.getBoundingClientRect());
                    }
                    if (settings.start) this.settings.start();
                }.bind(this));
                manager.on('panmove', function (e) {
                    // calculate actual delta
                    const deltaX = e.srcEvent.movementX;
                    const deltaY = e.srcEvent.movementY;
                    let deltaAngle = 0;
                    // calculate change in angle
                    if (changes.angle) {
                        const angle = _getAngle(e.srcEvent, this.$refs.mrr.getBoundingClientRect());
                        deltaAngle = angle - this.prevAngle;
                        this.prevAngle = angle;
                    }

                    // prepare output
                    const newValue = {
                        width: changes.width ? (settings.invertX ? this.value.width - deltaX : this.value.width + deltaX) : this.value.width,
                        height: changes.height ? (settings.invertY ? this.value.height - deltaY : this.value.height + deltaY) : this.value.height,
                        x: changes.x ? this.value.x + deltaX : this.value.x,
                        y: changes.y ? this.value.y + deltaY : this.value.y,
                        angle: changes.angle ? this.value.angle + deltaAngle : this.value.angle
                    };
                    // emit event
                    this.$emit('input', newValue);
                }.bind(this));
                manager.on('panend', function () {
                    if (settings.end) this.settings.end();
                }.bind(this));
                // add manager to array
                this.managers.pan.push(manager);
            },
            _removePanListener(manager) {
                manager.remove('panstart');
                manager.remove('panmove');
                manager.remove('panstop');
            },
            _rotateStart() {
                this.rotation = true;
            },
            _rotateEnd() {
                this.rotation = false;
            }
        }
    }
</script>

<style scoped lang="scss">
    .mrr-tool {
        position: absolute;
        display: block;
        stroke: aqua;
    }
    .mrr-tool-move {
        cursor: move;
    }
    .mrr-tool-resize {
        &.resize-diagonal {
            &.nwse {
                cursor: nwse-resize;
            }
            &.nesw {
                cursor: nesw-resize;
            }
        }
        &.resize-vertical {
            cursor: ns-resize;
        }
        &.resize-horizontal {
            cursor: ew-resize;
        }
    }
    .mrr-tool-rotate {
        &.nwse {
            cursor: nwse-resize;
        }
        &.nesw {
            cursor: nesw-resize;
        }
        &.guide {
            opacity: .3;
            stroke-dasharray: 4px, 12px;
            transition: stroke-dasharray .25s, opacity .25s;
            &[data-hover="true"] {
                stroke-dasharray: 2px, 6px;
                opacity: .4;
            }
        }
    }
</style>