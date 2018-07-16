<template>
    <svg ref="svg" class="clip-tool" :width="width || '100%'" :height="height || '100%'" :viewBox="viewbox" :data-action="action" @click="addPoint">
        <polygon class="clip-tool-path-outline" v-if="points.length > 0" ref="pathOutline" :points="path" stroke="transparent" :stroke-width="mOptions.strokeArea" fill="none"  @mouseenter="setPathHover" @mouseleave="setPathNormal"></polygon>
        <polygon class="clip-tool-path-display" v-if="points.length > 0" ref="pathDisplay" :points="path" :stroke="mOptions.stroke" :stroke-width="mOptions.strokeWidth" fill="none"></polygon>
        <g class="clip-tool-point" v-for="(point, i) of points" :key="i">
            <circle class="clip-tool-point-outline" :index="i" :cx="point[0]" :cy="point[1]" :r="mOptions.strokeArea / 2" stroke="none" fill="transparent"></circle>
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
                pathHover: false,
                disableAddPoint: false,
                action: null,
                points: this.value.slice(0, this.value.length),
                managers: []
            }
        },
        computed: {
            // mOptions merged from props and default
            mOptions() {
                return Object.assign({
                    stroke: '#00C2FF',
                    strokeWidth: 2,
                    strokeArea: 20
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
        },
        methods: {
            addPoint(e) {
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
                                const pointOnLine = getClosestPointOnLine([e.layerX, e.layerY], i === 0 ? this.points[this.points.length - 1] : this.points[i-1], i === this.points.length ? this.points[0] : this.points[i]);
                                this.points.splice(i, 0, pointOnLine);
                                this.endEdit();
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
                        [Hammer.Pan]
                    ]
                });
                manager.on('panstart', this.panStart);
                manager.on('pan', this.panMove);
                manager.on('panend', this.panEnd);
                this.managers.push(manager);
            },
            panStart() {
                this.disableAddPoint = true;
            },
            panMove(e) {
                const index = e.target.attributes.index.value;
                const x = this.points[index][0] + e.srcEvent.movementX;
                const y = this.points[index][1] + e.srcEvent.movementY;
                this.points.splice(index, 1, [x, y]);
            },
            panEnd() {
                setTimeout(function () {
                    this.disableAddPoint = false;
                }.bind(this), 100);
                this.endEdit();
            },
            setPathHover() {this.action = 'path'; },
            setPathNormal() {this.action = null; },
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
    .clip-tool {
        $circle-hover-size: 4px;
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        &[data-path-hover="true"] {
            cursor: copy;
            .clip-tool-path-display {
                stroke-dasharray: 2px, 2px;
            }
            .clip-tool-point-display {
                r: $circle-hover-size;
                transition: r .25s;
            }
        }
        .clip-tool-path-display {
            pointer-events: none;
            opacity: $opacity-hard;
            transition: opacity $duration;
        }

        // action
        &[data-action="path"] {

        }
        &[data-action="point"] {}
    }
</style>