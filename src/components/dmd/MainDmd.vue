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
import plasmaDot0 from '../../assets/graphics/dmd-sprites/plasma/0.svg';
import plasmaDot1 from '../../assets/graphics/dmd-sprites/plasma/1.svg';
import plasmaDot2 from '../../assets/graphics/dmd-sprites/plasma/2.svg';
import plasmaDot3 from '../../assets/graphics/dmd-sprites/plasma/3.svg';

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
    setupPlasmaStyle() {
        // Everything here is done once per component. The PIXI objects are
        // kept outside data() so that Vue does not make them reactive.
        const DISPLAY_W = 1024;
        const DISPLAY_H = 256;
        const DOT_SIZE = 8;
        const DISPLAY_MARGIN = 2*DOT_SIZE;
        const IMAGE_SIZE = 128*32;

        // one texture per brightness level, shared by all dots
        this.dotTextures = [0, 1, 2, 3].map((level) => PIXI.Texture.from(this.getDotTeture(level)));
        // the textures are SVG files that load in the background: render again when each one is ready
        this.dotTextures.forEach((texture) => {
            if(!texture.baseTexture.valid) {
                texture.baseTexture.once('loaded', () => this.renderPlasma());
            }
        });

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

        // create the 4096 dots once; drawPlasmaStyle() only changes their texture
        this.dots = [];
        for (let i = 0; i < IMAGE_SIZE; i++) {
            const dot = new PIXI.Sprite(this.dotTextures[0]);
            dot.width = 8;
            dot.height = 8;
            dot.x = (i % 128) * DOT_SIZE + DISPLAY_MARGIN;
            dot.y = Math.floor(i / 128) * DOT_SIZE + DISPLAY_MARGIN;
            dot.zIndex = 1000;
            container.addChild(dot);
            this.dots.push(dot);
        }
        // defining the post-effect filters for the display
        const blur = new PIXI.BlurFilter(1.5);
        const bloom = new AdvancedBloomFilter({blur:2,brightness:1.2,threshold:0.15,bloomScale:0.3});
        const bloom2 = new AdvancedBloomFilter({blur:6,brightness:1,threshold:0.25,bloomScale:1.1});
        const adj = new AdjustmentFilter({blue:0.55,green:0.75,gamma:0.8,saturation:0.85});

        this.pixiApp.stage.filters = [blur, bloom, bloom2, adj];
    },
    drawPlasmaStyle() {
        if(!this.dots) {
            this.setupPlasmaStyle();
        }
        const textures = this.dotTextures;
        for (let i = 0; i < this.dots.length; i++) {
            const level = this.getDotLevel(this.image0,this.image1,i);
            let texture = textures[0];
            if(level==1) {
                texture = textures[3];
            } else if(level==0.6) {
                texture = textures[2];
            } else if(level==0.4) {
                texture = textures[1];
            }
            this.dots[i].texture = texture;
        }
        this.renderPlasma();
    },
    renderPlasma() {
        // the display is only rendered when the image changes, not 60 times per second
        if(this.pixiApp && this.pixiApp.renderer) {
            this.pixiApp.render();
        }
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
                return plasmaDot1;
            case 2: 
                return plasmaDot2;
            case 3: 
                return plasmaDot3;
            default:
                return plasmaDot0;
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
  created() {
    // autoStart: false stops PIXI from redrawing the display (with four filters) on every frame
    this.pixiApp = new PIXI.Application({ background: '#0C0C0C', width: 1024+32, height: 256+32, autoStart: false });
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
    this.pixiApp = null;
    this.dots = null;
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