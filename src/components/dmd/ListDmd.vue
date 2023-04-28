<template>
      <div class="dmd-container">
        <canvas ref="dmd" class="dmd" width="256" height="64"></canvas>
      </div>
</template>

<script>

export default {
name: 'ListDmd',
props: {
  image: Uint8Array,
  index: Number,
},
data() {
  return {
    isDrawn: false
  }
},
methods: {
  drawImage() {
      const DOT_SIZE = 2;
      const IMAGE_SIZE = 128*32;
      const canvas = this.$refs.dmd;
      const ctx = canvas.getContext("2d");
      for(let i=0; i<IMAGE_SIZE; i++) {
          const dotX = (i % 128) * DOT_SIZE;
          const dotY = Math.floor(i / 128) * DOT_SIZE;
          const dotVal = this.getDotValue(this.image,i);
          ctx.beginPath();
          ctx.rect(dotX, dotY, DOT_SIZE, DOT_SIZE);
          ctx.fillStyle = `rgba(250, 136, 2, ${dotVal*255})`;
          ctx.fill();
      }
  },
  getDotValue(imageData,index) {
      const width = 128;
      const col = index % width;
      const byte = Math.floor(index/8);
      const bitPos = (col % 8);
      const bit =  ( imageData[byte] & 0xFF ) >> (bitPos) & 0x01; // get the value of the bit containing this pixel
      return bit;
  }
},
mounted() {
  this.drawImage();
  }
}

</script>

<style scoped>

.list-item-fullframe {
margin: 1rem;
width: 23.5rem;
height: 8.2rem;
background: var(--grey5);
border-radius: var(--radius-md);
cursor: pointer;
box-shadow: var(--shadow-btn-default);
}

.list-item-fullframe:hover {
background: var(--grey4);
box-shadow: var(--shadow-btn-hover);
}

.list-item-inner {
position: relative;
width: 100%;
height: 100%;
}

.dmd-container {
position: absolute;
top: var(--btn-outer-frame);
left: var(--btn-outer-frame);
bottom: var(--btn-outer-frame);
right: var(--btn-outer-frame);
border: 0.1rem solid var(--grey8);
display: flex;
align-items: center center;
}

.dmd {
width: calc(100% - var(--space-md));
margin: auto;
}

</style>