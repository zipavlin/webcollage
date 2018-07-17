<template>
    <svg ref="svg" class="clip-tool" :width="width || '100%'" :height="height || '100%'" :viewBox="viewbox" :data-action="action" @click="addPoint" @contextmenu="onContextMenu">
        <polygon class="clip-tool-path-outline" v-if="points.length > 0" ref="pathOutline" :points="path" stroke="transparent" :stroke-width="mOptions.strokeArea" fill="none"  @mouseenter="setPathHover" @mouseleave="setPathNormal">
            <title v-if="mOptions.pathTitle">{{mOptions.pathTitle}}</title>
        </polygon>
        <polygon class="clip-tool-path-display" v-if="points.length > 0" ref="pathDisplay" :points="path" :stroke="mOptions.stroke" :stroke-width="mOptions.strokeWidth" fill="none"></polygon>
        <g class="clip-tool-point" v-for="(point, i) of points" :key="i">
            <circle class="clip-tool-point-outline" :data-selected="i === selectedPoint" :index="i" :cx="point[0]" :cy="point[1]" :r="mOptions.strokeArea / 2" stroke="none" fill="transparent"><title v-if="mOptions.pointTitle">{{mOptions.pointTitle}}</title></circle>
            <circle class="clip-tool-point-display" :cx="point[0]" :cy="point[1]" :r="mOptions.strokeWidth" stroke="none" :fill="mOptions.stroke"></circle>
        </g>
    </svg>
</template>

<script>
    import Hammer from 'hammerjs';

    const getPathLength = (points) => {
        return points.reduce((sum, a, i) => {
            const b = i + 1 === points.length ? points[0] : points[i + 1];

            let dx = Math.abs(b[0] - a[0]),
                dy = Math.abs(b[1] - a[1]),
                dc = Math.pow(dx, 2) + Math.pow(dy, 2),
                c = Math.sqrt(dc);
            return sum + c;
        }, 0)
    };
    const getClosestPointOnLine = (p, A, B) => {
        let fTo;
        let x;
        let y;
        let dist;

        if (B[0] !== A[0]) {
            const a = (B[1] - A[1]) / (B[0] - A[0]);
            const b = B[1] - a * B[0];
            dist = Math.abs(a * p[0] + b - p[1]) / Math.sqrt(a * a + 1);
        }
        else {
            dist = Math.abs(p[0] - B[0]);
        }

        // length^2 of line segment
        const rl2 = Math.pow(B[1] - A[1], 2) + Math.pow(B[0] - A[0], 2);

        // distance^2 of pt to end line segment
        const ln2 = Math.pow(B[1] - p[1], 2) + Math.pow(B[0] - p[0], 2);

        // distance^2 of pt to begin line segment
        const lnm12 = Math.pow(A[1] - p[1], 2) + Math.pow(A[0] - p[0], 2);

        // minimum distance^2 of pt to infinite line
        const dist2 = Math.pow(dist, 2);

        // calculated length^2 of line segment
        const calcrl2 = ln2 - dist2 + lnm12 - dist2;

        if (calcrl2 > rl2) {
            if (lnm12 < ln2) {
                fTo = 0;
            }
            else {
                fTo = 1;
            }
        }
        else {
            // perpendicular from point intersects line segment
            fTo = ((Math.sqrt(lnm12 - dist2)) / Math.sqrt(rl2));
        }

        const dx = A[0] - B[0];
        const dy = A[1] - B[1];

        x = A[0] - (dx * fTo);
        y = A[1] - (dy * fTo);

        return [x, y];
    };

    export default {
        name: "ClipTool",
        props: {
            width: {
                default: 100
            },
            height: {
                default: 100
            },
            value: {
                default: []
            },
            options: {
                default: () => ({}),
                type: Object
            }
        },
        data() {
            return {
                selectedPoint: null,
                disableAddPoint: false,
                action: null,
                points: this.value.slice(0, this.value.length),
                managers: [],
                isMobile: (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4)))
            }
        },
        computed: {
            // mOptions merged from props and default
            mOptions() {
                return Object.assign({
                    stroke: '#00C2FF',
                    strokeWidth: 2,
                    strokeArea: 20,
                    pathTitle: null,
                    pointTitle: null,
                    confirmText: null,
                    minPointDistance: 10
                }, this.options);
            },
            viewbox() {
                return `0 0 ${this.width} ${this.height}`;
            },
            path() {
                return this.points.map(x => x.join(',')).join(' ');
            },
            length() {
                return getPathLength(this.points);
            }
        },
        mounted() {
            this.$refs.svg.querySelectorAll('.clip-tool-point-outline').forEach(circle => {
                this.registerEvents(circle);
            });
            if (this.isMobile) {
                const manager = new Hammer.Manager(this.$refs.svg, {
                    recognizers: [
                        [Hammer.Press]
                    ]
                });
                manager.on('press', function (e) {
                    this.onHoverMenu(e.srcEvent);
                }.bind(this));
            }
        },
        methods: {
            addPoint(e) {
                if (this.selectedPoint) return;
                if (!this.disableAddPoint) {
                    // create click point
                    let clickPoint = this.$refs.svg.createSVGPoint();
                    clickPoint.x = e.layerX;
                    clickPoint.y = e.layerY;
                    // check if target is polygon -> add new point between existing points
                    if (this.$refs.pathOutline && this.$refs.pathOutline.isPointInStroke(clickPoint)) {
                        // make a copy of array length. It goes to infinitive loop if not
                        const length = Number(this.points.length);
                        // try all positions of new point. If we have a right one, the length shouldn't change
                        for (let i = 1; i <= length; i++) {
                            // make a deep copy of array
                            const newPoints = this.points.slice(0, this.points.length);
                            // add new point
                            newPoints.splice(i, 0, [clickPoint.x, clickPoint.y]);
                            // calculate new length
                            const newLength = getPathLength(newPoints);
                            // add point to index = i if length didn't change for more than this.
                            if (Math.ceil(newLength) <= Math.ceil(this.length)) {
                                // find closest point on line
                                const pointOnLine = getClosestPointOnLine([e.layerX, e.layerY], this.points[(i === 0 ? this.points.length : i) - 1], this.points[i === this.points.length ? 0 : i]);
                                const prevPointDistance = Math.sqrt(Math.pow(Math.abs(this.points[(i === 0 ? this.points.length : 1) - 1][0] - pointOnLine[0]), 2) + Math.pow(Math.abs(this.points[(i === 0 ? this.points.length : 1) - 1][1] - pointOnLine[1]), 2));
                                const nextPointDistance = Math.sqrt(Math.pow(Math.abs(this.points[i === this.points.length ? 0 : i][0] - pointOnLine[0]), 2) + Math.pow(Math.abs(this.points[i === this.points.length ? 0 : i][1] - pointOnLine[1]), 2));
                                if (prevPointDistance >= this.mOptions.minPointDistance && nextPointDistance >= this.mOptions.minPointDistance) {
                                    this.points.splice(i, 0, pointOnLine);
                                    this.endEdit();
                                }
                                break;
                            }
                        }

                    }
                    // push new point to path
                    else {
                        let left = e.layerX;
                        let top = e.layerY;
                        // if shift key is pressed we assume user wants to put point in straight line
                        if (e.shiftKey && this.points.length !== 0) {
                            // get last item value
                            const lastPoint = this.points.slice(-1)[0];

                            // check which diff is smaller
                            const dx = Math.abs(left - lastPoint[0]);
                            const dy = Math.abs(top - lastPoint[1]);

                            if (dx > dy) {
                                top = lastPoint[1];
                            } else {
                                left = lastPoint[0];
                            }
                        }
                        this.points.push([left, top]);
                        this.endEdit();
                    }
                }
            },
            registerEvents (element) {
                const manager = new Hammer.Manager(element, {
                    recognizers: [
                        [Hammer.Tap],
                        [Hammer.Pan]
                    ]
                });
                manager.on('panstart', this.panStart);
                manager.on('pan', this.panMove);
                manager.on('panend', this.panEnd);
                manager.on('tap', this.tap);
                this.managers.push(manager);
            },
            panStart() {
                if (!this.selectedPoint) {
                    this.disableAddPoint = true;
                    this.action = 'point';
                }
            },
            panMove(e) {
                if (!this.selectedPoint) {
                    const index = e.target.attributes.index.value;
                    const x = this.points[index][0] + e.srcEvent.movementX;
                    const y = this.points[index][1] + e.srcEvent.movementY;
                    this.points.splice(index, 1, [x, y]);
                }
            },
            panEnd() {
                if (!this.selectedPoint) {
                    setTimeout(function () {
                        this.disableAddPoint = false;
                    }.bind(this), 100);
                    this.endEdit();
                    this.action = null;
                }
            },
            tap(e) {
                const index = parseInt(e.target.attributes.index.value);
                if (this.selectedPoint === index) {
                    this.selectedPoint = null;
                    this.action = null;
                    // remove event listener
                    window.removeEventListener('keydown', this.onKeyDown);
                } else {
                    this.selectedPoint = index;
                    this.action = 'delete';
                    // add event listener
                    window.addEventListener('keydown', this.onKeyDown);
                }
            },
            setPathHover() {
                if (!this.action) {
                    this.action = 'path';
                }
            },
            setPathNormal() {
                if (this.action === 'path') {
                    this.action = null;
                }
            },
            onKeyDown(e) {
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    e.preventDefault();
                    this.points.splice(this.selectedPoint, 1);
                }
                this.action = null;
                this.selectedPoint = null;
                window.removeEventListener('keydown', this.onKeyDown);
            },
            onContextMenu(e) {
                if (this.$listeners.contextmenu) {
                    e.preventDefault();
                    this.$emit('contextmenu', e);
                }
            },
            endEdit() {
                // check if num of point changed
                if (this.managers.length !== this.points.length) {
                    // reset managers
                    setTimeout(function () {
                        this.managers.forEach(manager => manager.destroy());
                        this.managers = [];
                        this.$refs.svg.querySelectorAll('.clip-tool-point-outline').forEach(circle => {
                            this.registerEvents(circle);
                        });
                    }.bind(this), 100);
                }
                this.$emit('input', this.points);
                this.$emit('change');
            }
        }
    }
</script>

<style scoped lang="scss">
    $opacity-transparent: 0;
    $opacity-light: .2;
    $opacity-medium: .4;
    $opacity-hard: .8;
    $duration: .25s;
    $hoverPointSize: 3px;
    $hoverSelectedSize: 6px;
    .clip-tool {
        $circle-hover-size: 4px;
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        // path
        .clip-tool-path-display {
            pointer-events: none;
            opacity: $opacity-hard;
            transition: opacity $duration;
        }
        // point
        .clip-tool-point-display {
            pointer-events: none;
            transition: r $duration, opacity $duration;
        }

        // action
        &:not([data-action="delete"]) .clip-tool-point-outline {
            cursor: move;
            &:hover + .clip-tool-point-display {
                r: $hoverSelectedSize;
            }
        }
        &[data-action="path"] {
            .clip-tool-path-outline {
                cursor: copy;
            }
            .clip-tool-point-display {
                r: $hoverPointSize;
            }
        }
        &[data-action="point"] {
            .clip-tool-path-display {
                stroke-dasharray: 2px, 2px;
                opacity: $opacity-medium;
            }
        }
        &[data-action="delete"] {
            .clip-tool-path-display {
                stroke-dasharray: 2px, 2px;
                opacity: $opacity-light;
            }
            .clip-tool-point-outline[data-selected="true"] + .clip-tool-point-display {
                r: $hoverSelectedSize;
            }
            .clip-tool-point-outline:not([data-selected="true"]) + .clip-tool-point-display {
                opacity: $opacity-medium;
            }
        }
    }
</style>