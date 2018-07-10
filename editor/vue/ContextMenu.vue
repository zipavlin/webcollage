<template>
    <div class="context-menu" :style="style">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "ContextMenu",
        props: ['left', 'top', 'name'],
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
                this.$emit('close');
            }
        }
    }
</script>

<style scoped lang="scss">
    .context-menu {
        position: absolute;
        display: block;
        background-color: #fff;
        box-shadow: 0 0 7px rgba(0, 0, 0, .3);
        padding: 0;
        &-btn {
            display: block;
            position: relative;
            width: 100%;
            padding: 10px 20px;
            box-sizing: border-box;
            background-color: #fff;
            cursor: pointer;
            outline: none;
            text-align: left;
            &:hover {
                background-color: #eee;
            }
        }
    }
</style>