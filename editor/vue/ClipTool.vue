<template>
    <svg ref="SVG" class="clip-tool" :width="width || '100%'" :height="height || '100%'" :viewBox="viewbox" :data-path-hover="pathHover" @click="addPoint">
        <polygon class="clip-tool-path" v-if="points.length > 0" :points="path" ref="polygon" @mouseenter="setPathHover" @mouseleave="setPathNormal"></polygon>
        <circle class="clip-tool-point" v-for="(point, i) of points" :key="i" :index="i" :cx="point[0]" :cy="point[1]" r="2"></circle>
    </svg>
</template>

<script>
    import Hammerjs from 'hammerjs';
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

    export default {
        name: "ClipTool",
        //props: ['width', 'height', 'value'],
        props: {
            width: {
                default: 100
            },
            height: {
                default: 100
            },
            value: {
                default: []
            }
        },
        data() {
            return {
                pathHover: false,
                points: this.value,
                managers: []
            }
        },
        watch: {
            value() {
                // destroy and register new move listeners when value changes
                // destroy all existing managers
                managers.forEach(manager => manager.destroy());
                // create new manager for each point

            }
        },
        computed: {
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
        methods: {
            addPoint(e) {
                // create click point
                let clickPoint = this.$refs.SVG.createSVGPoint();
                clickPoint.x = e.layerX;
                clickPoint.y = e.layerY;
                // check if target is polygon -> add new point between existing points
                if (this.$refs.polygon && this.$refs.polygon.isPointInStroke(clickPoint)) {
                    // make a copy of array length. It goes to infinitive loop if not
                    const length = Number(this.value.length);
                    // try all positions of new point. If we have a right one, the length shouldn't change
                    for (let i = 1; i <= length; i++) {
                        // make a deep copy of array
                        const newPoints = this.value.slice(0, this.value.length);
                        // add new point
                        newPoints.splice(i, 0, [clickPoint.x, clickPoint.y]);
                        // calculate new length
                        const newLength = getPathLength(newPoints);
                        // add point to index = i if lenght didn't change
                        if (Math.ceil(newLength) === Math.ceil(this.length)) {
                            this.points.splice(i, 0, [e.layerX, e.layerY]);
                            this.$emit('input', this.points);
                            this.$emit('change');
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
                    this.$emit('input', this.points);
                    this.$emit('change');
                }
            },
            setPathHover() {this.pathHover = true; },
            setPathNormal() {this.pathHover = false; }
        }
    }
</script>

<style scoped lang="scss">
    .clip-tool {
        $circle-hover-size: 4px;
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        &[data-path-hover="true"] {
            polygon {
                stroke-width: $circle-hover-size;
            }
            circle {
                r: $circle-hover-size;
                transition: r .25s;
            }
        }
        polygon {
            stroke: #0d121d;
            stroke-width: 2px;
            fill: transparent;
            transition: stroke-width .25s;
        }
        circle:hover {
            r: $circle-hover-size;
        }
    }
</style>