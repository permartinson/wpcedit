<template>
    <div class="dmd-container" ref="container">
      <canvas v-if="settings.displayStyle!= 0" ref="dmd" width="1024" height="256" class="dmd"></canvas>
    </div> 
</template>

<script>
import * as PIXI from 'pixi.js';
import {AdvancedBloomFilter} from '@pixi/filter-advanced-bloom';
import {AdjustmentFilter} from '@pixi/filter-adjustment';
import { storeToRefs } from 'pinia';
import store from "../../stores/store.js";
import { useMainStore } from '../../stores/mainStore.js';

const MainStore = useMainStore(store);

export default {
  name: 'MainDmd',
  props: {
    image0: Uint8Array,
    image1: Uint8Array,
    index: Number
  },
  data() {
    return {
        pixiApp: new PIXI.Application({ background: '#0C0C0C', width: 1024+32, height: 256+32 }),
        doExport: false
    }
  },
  setup() {
        const { settings } = storeToRefs(MainStore);
        return {
            settings
        }
    },
  methods: {
    drawImage() {
      // the two styles are made through very different approaces, so they are separated into their own methods:
      if(this.settings.displayStyle == 0) {
        this.drawPlasmaStyle();
      } else {
        this.drawPlain(this.settings.displayStyle);
      }
    },
    drawPlasmaStyle() {
        const DISPLAY_W = 1024;
        const DISPLAY_H = 256;
        const DOT_SIZE = 8;
        const DISPLAY_MARGIN = 2*DOT_SIZE;
        const IMAGE_SIZE = 128*32;

        const level0 = this.getDotTeture(0);
        const level1 = this.getDotTeture(1);
        const level2 = this.getDotTeture(2);
        const level3 = this.getDotTeture(3);

        const texture0 = PIXI.Texture.from(level0);
        const texture1 = PIXI.Texture.from(level1);
        const texture2 = PIXI.Texture.from(level2);
        const texture3 = PIXI.Texture.from(level3);

        const dmdDiv = this.$refs.container;
        dmdDiv.appendChild(this.pixiApp.view);
        this.pixiApp.view.style.width = "100%";
        const container = new PIXI.Container();
        this.pixiApp.stage.addChild(container);
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0xF0C0C0C);

        // draw a background rectangle. without it, the bloom effect will appear "cut off" at the edge of the dmd area
        graphics.drawRect(0, 0, DISPLAY_W+2*DISPLAY_MARGIN, DISPLAY_H+2*DISPLAY_MARGIN);
        graphics.zIndex = 1;
        container.addChild(graphics);

        for (let i = 0; i < IMAGE_SIZE; i++) {
            let level = 0;
            level = this.getDotLevel(this.image0,this.image1,i);
            let dot = new PIXI.Sprite(texture0);
            if(level==1) {
                dot = new PIXI.Sprite(texture3);
            } else if(level==0.6) {
                dot = new PIXI.Sprite(texture2);
            } else if(level==0.4) {
                dot = new PIXI.Sprite(texture1);
            }
            dot.width = 8;
            dot.height = 8;
            dot.x = (i % 128) * DOT_SIZE + DISPLAY_MARGIN;
            dot.y = Math.floor(i / 128) * DOT_SIZE + DISPLAY_MARGIN;
            dot.zIndex = 1000;
            container.addChild(dot);
        }
        // defining the post-effect filters for the display
        const blur = new PIXI.BlurFilter(1.5);
        const bloom = new AdvancedBloomFilter({blur:2,brightness:1.2,threshold:0.15,bloomScale:0.3});
        const bloom2 = new AdvancedBloomFilter({blur:6,brightness:1,threshold:0.25,bloomScale:1.1});
        const adj = new AdjustmentFilter({blue:0.55,green:0.75,gamma:0.8,saturation:0.85});

        this.pixiApp.stage.filters = [blur, bloom, bloom2, adj];
    },
    drawPlain(style) {
      let color =  "225, 225, 225";
      if(style == 1 || style == 2) {
        color =  "220, 133, 33";
      }
      const canvas = this.$refs.dmd;
      const DOT_SIZE = 8;
      const IMAGE_SIZE = 128*32;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.rect(0, 0, 1024, 256);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
      for(let i=0; i<IMAGE_SIZE; i++) {
          const offset = DOT_SIZE/2;
          const dotX = (i % 128) * DOT_SIZE;
          const dotY = Math.floor(i / 128) * DOT_SIZE;
          const dotVal = this.getDotLevel(this.image0,this.image1,i);
          ctx.beginPath();
          if(style == 1 || style == 3) { // this is circular pixels
            ctx.arc(dotX+offset, dotY+offset, offset*0.9, 0, 2 * Math.PI, false);
          } else { // and this is  square pixels
            ctx.rect(dotX, dotY, DOT_SIZE, DOT_SIZE);
          }
          ctx.fillStyle = `rgba(${color}, ${dotVal*1})`;
          ctx.fill();
      }
    },
    getDotLevel(image0Data,image1Data,index) {
        const width = 128;
        const col = index % width;
        const byte = Math.floor(index/8);
        const bitPos = (col % 8);
        // get the values of the bits of this pixel index
        const image0Bit =  ( image0Data[byte] & 0xFF ) >>(bitPos) & 0x01;
        const image1Bit =  ( image1Data[byte] & 0xFF ) >>(bitPos) & 0x01;
        // if both planes are 1, the brightness is 100%
        let level = image0Bit * 0.6 + image1Bit * 0.4;
        return level;
    },
    getDotTeture(level) {
        switch(level){
            case 1: 
                return require('@/assets/graphics/dmd-sprites/plasma/1.svg');
            case 2: 
                return require('@/assets/graphics/dmd-sprites/plasma/2.svg');
            case 3: 
                return require('@/assets/graphics/dmd-sprites/plasma/3.svg');
            default:
                return require('@/assets/graphics/dmd-sprites/plasma/0.svg');
        }
    },
    downloadPng() {
      if(this.settings.displayStyle == 0) {
        this.pixiApp.render();
        // render the display as a png
        const promise = this.pixiApp.renderer.plugins.extract.base64();
        promise.then(
          (image) => {
            // generate a hidden link and then trigger it to create the download action
            let link = document.createElement("a");
            link.href = image;
            let filename = "plane.png"
            if(this.index) {
              filename = "plane"+this.index+".png";
            }
            link.download = filename;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          }
        )
      } else {
        // when the image was rendered to a plain canvas, use the built-in .toDataUrl() method
        const canvas = this.$refs.dmd;
        const image = canvas.toDataURL('image/png');
        let link = document.createElement("a");
        link.href = image;
        let filename = "plane.png"
        if(this.index) {
          filename = "plane"+this.index+".png";
        }
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      }
    }
  },
  mounted() {
    this.drawImage();
  },
  updated() {
    this.drawImage();
  },
  beforeUpdate() {
  },
  beforeUnmount() {
    // kill the app when not used so we don't end up with a huge amount parallel processes
    this.pixiApp.destroy();
  }
}

</script>

<style scoped>

.dmd {
   width: 100%;
}

.dmd-container canvas {
}
</style>