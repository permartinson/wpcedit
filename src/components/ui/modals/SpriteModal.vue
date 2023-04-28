<template>
    <BaseModal :show="show" @close="$emit('close')">
        <ModalHeader
            :stepBtns="true"
            :closeBtn="true"
            :title="title"
            @next="goNext()"
            @prev="goPrev()"
            @next2="goN2()"
            @prev2="goP2()"
            @close="$emit('close')">
        </ModalHeader>
        <div class="modal-body">
            <MainDmd :image0="image0()" :image1="image1()" :index="planeIndices.current" ref="main"></MainDmd>
            <div class="sub-dmds">
                <div>
                    <SubDmd
                        class="plane plane0"
                        :title="this.currPlaneTitle"
                        :isEnabled="true"
                        :image="image0()">
                    </SubDmd>
                    <OffsetControl
                        @move-x="moveSprite0X"
                        @move-y="moveSprite0Y"
                        :xOffset="xOffset0"
                        :yOffset="yOffset0">
                    </OffsetControl>
                </div>
                <div>
                    <SubDmd
                        class="plane plane1"
                        :checkbox="this.blendPlaneLabel"
                        :image="blendImage()"
                        :isEnabled="this.doBlend"
                        :navBtns="true"
                        @next="goToNextBlendPlane()"
                        @prev="goToPrevBlendPlane()"
                        @enabled="setBlendStatus">
                    </SubDmd>
                    <OffsetControl
                        @move-x="moveSprite1X"
                        @move-y="moveSprite1Y"
                        :xOffset="xOffset1"
                        :yOffset="yOffset1">
                    </OffsetControl>
                </div>
            </div>
        </div>
        <ModalFooter>
            <ExportSection @export-main="exportCurrentSprite(0)" @export-blend="exportCurrentSprite(1)" :options="options">
            </ExportSection>
        </ModalFooter>
    </BaseModal>
</template>

<script>
import BaseModal from './BaseModal.vue';
import ModalHeader from './ModalHeader.vue';
import ModalFooter from './ModalFooter.vue';
import ExportSection from '../ExportSection.vue';
import MainDmd from '../../dmd/MainDmd.vue';
import SubDmd from '../../dmd/SubDmd.vue';
import OffsetControl from '../../ui/OffsetControl.vue';
import { toHex } from '../../../helpers/formatting.js';
import { storeToRefs } from 'pinia';
import store from "../../../stores/store.js";
import { useMainStore } from '../../../stores/mainStore.js';

const MainStore = useMainStore(store);

export default {
    name: 'SpriteModal',
    components: { 
        BaseModal,
        ModalHeader,
        ModalFooter,
        ExportSection,
        MainDmd,
        SubDmd,
        OffsetControl
    },
    setup() {
        const { exportOption, settings } = storeToRefs(MainStore);
        return {
            exportOption,
            settings
        }
    },
    data() {
        // fetch the selected export option and create an object to pass the data for the selector
        const options = new Array();
        const labels = [
            'PNG image from render',
            'Monochrome BMP image',
            'Monochrome BMP image (inverted)',
            'Raw byte array'
        ]
        for(let i=0;i<labels.length;i++) {
            const selected = (i == this.exportOption);
            options.push({value:i,label:labels[i],selected:selected})
        }

        return {
            doBlend: false,
            offset: 0,
            blendOffset: 1,
            xOffset0: -1,
            yOffset0: -1,
            xOffset1: -1,
            yOffset1: -1,
            prevTable: -1,
            options
        }
    },
    props: {
        show: Boolean,
        index: Number,
        table: Number
    },
    computed: {
        planeIndices() {
            const currIndex = Math.max(this.index+this.offset,0);
            return {
                current: currIndex,
                blend: Math.max(currIndex+this.blendOffset,0),
            }
        },
        currPlaneTitle() {
            return `This sprite, index ${this.planeIndices.current}`;
        },
        blendPlaneLabel() {
            return `Blend with index ${this.planeIndices.blend}`;
        },
        title() {
            return `Image ${toHex(MainStore.getSpriteAt(this.table,this.planeIndices.current).address,6)}`;
        }
    },
    methods: {
        image0() {
            const indices = this.planeIndices;
            const sprite = MainStore.getSpriteAt(this.table,indices.current);
            // when the offset values of the main frame are init (-1), compute a center position and use as offset value:
            if(this.xOffset0 == -1 && this.yOffset0 == -1) {
                this.xOffset0 = Math.floor((128-sprite.width)/2);
                this.yOffset0 = Math.floor((32-sprite.height)/2);
            }
            // position the sprite in a full frame at the offset position
            return MainStore.getSpriteAsFullFrame(sprite,this.xOffset0,this.yOffset0);
        },
        image1() {
            if(this.doBlend) {
                return this.blendImage();
            }
            return this.image0();
        },
        blendImage() {
            const indices = this.planeIndices;
            const sprite = MainStore.getSpriteAt(this.table,indices.blend);
            // when the offset values of the blend frame are init (-1), compute a center position and use as offset value:
            if(this.xOffset1 == -1 && this.yOffset1 == -1) {
                this.xOffset1 = Math.floor((128-sprite.width)/2);
                this.yOffset1 = Math.floor((32-sprite.height)/2);
            }
            // position the sprite in a full frame at the offset position
            return MainStore.getSpriteAsFullFrame(sprite,this.xOffset1,this.yOffset1);
        },
        setBlendStatus(state) {
            if(state == true) {
                this.doBlend = true;
            } else if(state == false) {
                this.doBlend = false;
            }
        },
        goToNextBlendPlane() {
            this.blendOffset++;
        },
        goToPrevBlendPlane() {
            this.blendOffset--;
        },
        goNext() {
            this.offset++;
            this.setInitValues();
        },
        goPrev() {
            if(this.planeIndices.current > 0) {
                this.offset--;
            }
            this.setInitValues();
        },
        goN2() {
            this.offset+=2;
            this.setInitValues();
        },
        goP2() {
            if(this.planeIndices.current > 0) {
                this.offset-=2;
            }
            this.setInitValues();
        },
        moveSprite0X(amount) {
            this.xOffset0 += amount;
        },
        moveSprite0Y(amount) {
            this.yOffset0 += amount;
        },
        moveSprite1X(amount) {
            this.xOffset1 += amount;
        },
        moveSprite1Y(amount) {
            this.yOffset1 += amount;
        },
        setInitValues() {
            // reset the values
            this.blendOffset = 1;
            // only reset the offset if we entered a new table, otherwise we want to 
            // keep the offset so we quickly may step through animations:
            if (this.table != this.prevTable) {
                this.xOffset0 = -1;
                this.yOffset0 = -1;
                this.xOffset1 = -1;
                this.yOffset1 = -1;
            }
        },
        exportCurrentSprite(planeToExport) {
            let index = this.planeIndices.current;
            if(planeToExport == 1) {
                index = this.planeIndices.blend;
            }
            if(this.exportOption == 0) { // png export is handled within the main dmd component:
                this.$refs.main.downloadPng();
            } else if(this.exportOption == 3) { // raw data array export
                const dataString =  MainStore.exportAsDataArray(MainStore.getSpriteAt(this.table,index).image);
                let link = document.createElement("a");
                link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataString);
                const filename = "plane"+index+".txt";
                link.download = filename;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            } else if(this.exportOption == 1 || this.exportOption == 2) { // bitmap export
                let inverted = false;
                if(this.exportOption == 2) {
                    inverted = true;
                }
                let xOffset = this.xOffset0;
                let yOffset = this.yOffset0;
                if(planeToExport == 1) {
                    xOffset = this.xOffset1;
                    yOffset = this.yOffset1;
                }
                const sprite = MainStore.getSpriteAt(this.table,index);
                // For some reason, the bmp export only works with a few sprites in their native size
                // and i have note been able to figure out why, it might be som discrepancy in the
                // declared size of the sprites and their actual size. Or something else.
                // Anyway, as aworkaroud all sprites are now exported as full frame bmps.
                const image = MainStore.getSpriteAsFullFrame(sprite,xOffset,yOffset);
                let bmp = MainStore.exportAs1bitBmp(image,inverted,128,32);
                let link = document.createElement("a");
                link.href = 'data:image/bmp;base64,' + bmp;
                const filename = "plane"+index+".bmp";
                link.download = filename;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            }
        }
    },
    updated() {
        this.offset = 0;
        this.setInitValues();
        this.prevTable = this.table; // flag to see if a new table was entered
    }
}
</script>

<style scoped>
.sub-dmds {
    margin-top: var(--space-md);
    display: grid;
    gap: var(--space-md);
    grid-template-columns: 1fr 1fr;
}
.plane {
    justify-self: left;
}
.modal-body {
    margin: 0 var(--space-md);
}
</style>