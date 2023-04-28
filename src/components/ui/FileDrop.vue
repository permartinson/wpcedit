<template>
    <div class="wrapper">
        <div class="decoration up"></div>
        <div class="drop-container">
            <div class="file-drop">
                <div class="label">Drop a WPC Pinball game ROM file here</div>
                <div class="symbol">
                    <div class="arrow"></div>
                    <div class="plate"></div>
                </div>
            </div>
            <input type="file" ref="romfile" @change="loaded" title="" />
        </div>
        <div class="decoration down"></div>
    </div>
</template>

<script>
export default {
  name: 'FileDrop',
  props: {
  },
  methods: {
    loaded() {
        const file = this.$refs.romfile.files[0];
        this.$emit('loaded',file);
        }
    }
}
</script>

<style scoped>
.wrapper {
    width: 60rem;
    margin: 0 auto;
}
.drop-container {
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: inline-block;
}
.decoration {
    width: 100%;
    height: 1.4rem;
    z-index: 200;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: url('../../assets/graphics/ui/file-drop-decoration.svg');
}
.decoration.down {
    transform: rotate(180deg);
    margin-top: -2px;
}
.file-drop {
    width: 60rem;
    height: 21rem;
    background: url('../../assets/graphics/ui/file-drop-bg.svg');
    background-color: var(--grey4);
    border-radius: 0.4rem;
    text-align: center;
    box-shadow:  0px 4px 16px 0px rgba(0, 0, 0, 0.25);;
    z-index: 300;
}
.drop-container:hover .file-drop, .drop-container:drop .file-drop {
    background-color: var(--grey3);
}

input[type=file] {
    cursor: pointer;
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    opacity: 0;
}
.symbol {
    position: relative;
    width: 100%;
    height: 40px;
    margin-top: 3.2rem;
}
.label {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--grey8);
    padding-top: 4.8rem;
}
.arrow {
    width: 100%;
    height: 26px;
    background: url('../../assets/graphics/ui/file-drop-arrow.svg');
    background-position: center;
    background-repeat: no-repeat;
    padding-top: 0;
    transition: all 0.2s;
}
.drop-container:hover .arrow {
    padding-top: 0.8rem;
}

.plate {
    width: 100%;
    height: 14px;
    position: absolute;
    bottom: 0;
    background: url('../../assets/graphics/ui/file-drop-plate.svg');
    background-position: center;
    background-position: center;
    background-repeat: no-repeat;
}
</style>