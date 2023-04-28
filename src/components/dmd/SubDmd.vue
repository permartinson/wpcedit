<template>
  <div>
    <div class="controls">
      <p v-if="title" class="title">{{ title }}</p>
      <CheckBox v-if="checkbox" @change="checked" :checked="isEnabled" :label="checkbox" ref="checkbox"></CheckBox>
      <div v-if="navBtns" class="nav-btns">
        <MinimalButton @click="this.$emit('prev');" size="small"><SmallIcon type="left"></SmallIcon>Previous</MinimalButton>
        <MinimalButton @click="this.$emit('next');" size="small" class="btn-next">Next<SmallIcon type="right"></SmallIcon></MinimalButton>
      </div>
    </div>
    <div class="dmd-container">
      <canvas ref="dmd" width="512" height="128" class="dmd"></canvas>
    </div>
  </div>
</template>

<script>
import CheckBox from '../ui/CheckBox.vue';
import MinimalButton from '../ui/buttons/MinimalButton.vue';
import SmallIcon from '../icons/SmallIcon.vue';

export default {
  name: 'SubDmd',
  components: {
    CheckBox,
    MinimalButton,
    SmallIcon

  },
  props: {
    image: Uint8Array,
    title: String,
    checkbox: String,
    navBtns: Boolean,
    isEnabled: Boolean
  },
  methods: {
    drawImage() {
        const DOT_SIZE = 4;
        const IMAGE_SIZE = 128*32;
        const canvas = this.$refs.dmd;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let color =  "130, 100, 80";
        if(this.isEnabled) { // the color of the display changes depending on the state
          color = "220, 133, 33";
        }
        for(let i=0; i<IMAGE_SIZE; i++) {
            const dotX = (i % 128) * DOT_SIZE + DOT_SIZE/2;
            const dotY = Math.floor(i / 128) * DOT_SIZE + DOT_SIZE/2;
            const dotVal = this.getDotValue(this.image,i);
            ctx.beginPath();
            ctx.arc(dotX, dotY, DOT_SIZE/2*0.9, 0, 2 * Math.PI, false);
            ctx.fillStyle = `rgba(${color}, ${dotVal})`;
            ctx.fill();
        }
    },
    getDotValue(imageData,index) {
        const width = 128;
        const col = index % width;
        const byte = Math.floor(index/8);
        const bitPos = (col % 8);
        const bit =  ( imageData[byte] & 0xFF ) >>(bitPos) & 0x01; // get the value of the bit containing this pixel
        return bit;
    },
    checked(value) {
      this.$emit('enabled', value);
    }
  },
  mounted() {
    this.drawImage();
  },
  updated() {
    this.drawImage();
  }
}

</script>

<style scoped>
.controls {
  height: 3.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-btns {
  display: flex;
}
.title {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--grey7);
}
.btn-next {
  margin-left: var(--space-sm);
}
.dmd-container {
  background: var(--black);
}
.dmd {
  width: 100%;
}
</style>