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
            <div class="sub-dmds blend">
                <SubDmd
                    class="plane plane0"
                    :title="this.currPlaneTitle"
                    :isEnabled="true"
                    :image="mainImage()">
                </SubDmd>
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
            </div>
            <div class="sub-dmds merge">
                <div class="plane plane0">
                    <SubDmd
                        :checkbox="this.merge0Label"
                        :image="merge0Image()"
                        :isEnabled="this.doMerge0"
                        :navBtns="true"
                        @next="goToNextMerge0Plane()"
                        @prev="goToPrevMerge0Plane()"
                        @enabled="setMerge0Status">
                    </SubDmd>
                    <CheckBox v-if="settings.optionalInbetweening" class="in-between" @change="setBetween0Status" :checked="true" label="Also apply the planes in between" ref="inBetween0"></CheckBox>
                </div>
                <div>
                    <SubDmd
                        class="plane plane1"
                        :checkbox="this.merge1Label"
                        :image="merge1Image()"
                        :isEnabled="this.doMerge1"
                        :navBtns="true"
                        @next="goToNextMerge1Plane()"
                        @prev="goToPrevMerge1Plane()"
                        @enabled="setMerge1Status">
                    </SubDmd>
                    <CheckBox v-if="settings.optionalInbetweening" class="in-between" @change="setBetween1Status" :checked="true" label="Also apply the planes in between" ref="inBetween1"></CheckBox>
                </div>
            </div>
        </div>
        <ModalFooter>
            <ExportSection @export-main="exportCurrentFrame(0)" @export-blend="exportCurrentFrame(1)" :options="options">
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
import CheckBox from '../../ui/CheckBox.vue';
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
        CheckBox
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
            doBlend: true,
            doMerge0: false,
            doMerge1: false,
            offset: 0,
            blendOffset: 1,
            merge0Offset: 2,
            merge1Offset: 3,
            doInBetween0: true,
            doInBetween1: true,
            exportMainDmd: -1,
            options: options
        }
    },
    props: {
        show: Boolean,
        index: Number
    },
    computed: {
        planeIndices() {
            const currIndex = Math.max(this.index+this.offset,0);
            return {
                current: currIndex,
                blend: Math.max(currIndex+this.blendOffset,0),
                merge0: Math.max(currIndex+this.merge0Offset,0),
                merge1: Math.max(currIndex+this.merge1Offset,0)
            }
        },
        // create strings for labels and titles:
        currPlaneTitle() {
            return `This plane, index ${this.planeIndices.current}`;
        },
        blendPlaneLabel() {
            return `Blend with index ${this.planeIndices.blend}`;
        },
        merge0Label() {
            return `Apply index ${this.planeIndices.merge0} on top`;
        },
        merge1Label() {
            return `Apply index ${this.planeIndices.merge1} on top`;
        },
        title() {
            return `Image ${toHex(MainStore.getFullFrameImageAt(this.planeIndices.current).address,6)}`;
        },
        subTitle() {
            return `Table ${toHex(MainStore.getFullFrameImageAt(this.planeIndices.current).tableAddress,6)}`;
        }
    },
    methods: {
        image0() {
            return this.mainImage();
        },
        image1() {
            if(this.doBlend) {
                return this.blendImage();
            }
            return this.mainImage();
        },
        mainImage() {
            const indices = this.planeIndices;
            if(this.doMerge0) { // apply the merge image if checked
                let image1 = MainStore.getFullFrameImageAt(indices.current).image;
                if(this.doInBetween0) { // if in-betweening is active (default), figure out the frames between the main frame and the merge frame
                    for(let i=1; i<=Math.abs(indices.merge0-indices.current); i++) {
                        if(this.doBlend && i%2!=0) { // if blend is active, only use every second frame (because the other most likely belongs to the blend frame)
                            continue;
                        } else {
                            const plane2 = MainStore.getFullFrameImageAt(indices.current+i);
                            image1 = MainStore.mergePlanes(image1,plane2);
                        }
                    }
                } else {
                    const plane2 = MainStore.getFullFrameImageAt(indices.merge0);
                    image1 = MainStore.mergePlanes(image1,plane2);
                }
                return image1;
            }
            return MainStore.getFullFrameImageAt(indices.current).image;
        },
        blendImage() {
            const indices = this.planeIndices;
            let image1 = MainStore.getFullFrameImageAt(indices.blend).image;
            if(this.doMerge1) { // apply the merge image if checked
                if(this.doInBetween1) { // if in-betweening is active (default), figure out the frames between the main frame and the merge frame
                    for(let i=1; i<=Math.abs(indices.merge1-indices.current); i++) {
                        if(this.doBlend && i%2!=1) { // if blend is active, only use every second frame (because the other most likely belongs to the main frame)
                            continue;
                        } else {
                            const plane2 = MainStore.getFullFrameImageAt(indices.current+i);
                            image1 = MainStore.mergePlanes(image1,plane2)
                        }
                    }
                } else {
                    const plane2 = MainStore.getFullFrameImageAt(indices.merge1);
                    image1 = MainStore.mergePlanes(image1,plane2)
                }
                return image1;
            }
            return MainStore.getFullFrameImageAt(indices.blend).image;
        },
        merge0Image() {
            const indices = this.planeIndices;
            return MainStore.getFullFrameImageAt(indices.merge0).image;
        },
        merge1Image() {
            const indices = this.planeIndices;
            return MainStore.getFullFrameImageAt(indices.merge1).image;
        },
        setBlendStatus(state) {
            if(state == true) {
                this.doBlend = true;
            } else if(state == false) {
                this.doBlend = false;
            }
        },
        setMerge0Status(state) {
            if(state == true) {
                this.doMerge0 = true;
            } else if(state == false) {
                this.doMerge0 = false;
            }
        },
        setMerge1Status(state) {
            if(state == true) {
                this.doMerge1 = true;
            } else if(state == false) {
                this.doMerge1 = false;
            }
        },
        setBetween0Status(state) {
            if(state == true) {
                this.doInBetween0 = true;
            } else if(state == false) {
                this.doInBetween0 = false;
            }
        },
        setBetween1Status(state) {
            if(state == true) {
                this.doInBetween1 = true;
            } else if(state == false) {
                this.doInBetween1 = false;
            }
        },
        goToNextBlendPlane() {
            this.blendOffset++;
        },
        goToPrevBlendPlane() {
            this.blendOffset--;
        },
        goToNextMerge0Plane() {
            let offset = 1;
            if(this.doInBetween0 && this.doBlend) { // in-betweening will only render evey other frame, so we need to skip one
                offset = 2;
            }
            this.merge0Offset += offset;
            if(this.doBlend) { // syncronize if in blend mode
                this.merge1Offset += offset;
            }
        },
        goToPrevMerge0Plane() {
            let offset = 1;
            if(this.doInBetween0 && this.doBlend) { // in-betweening will only render evey other frame, so we need to skip one
                offset = 2;
            }
            if(this.merge0Offset > 0) {
               this.merge0Offset-=offset;
               if(this.doBlend) { // syncronize if in blend mode
                    this.merge1Offset -= offset;
                }
            }
        },
        goToNextMerge1Plane() {
            let offset = 1;
            if(this.doInBetween1 && this.doBlend) { // in-betweening will only render evey other frame, so we need to skip one
                offset = 2;
            }
            this.merge1Offset+=offset;
            if(this.doBlend) { // syncronize if in blend mode
                this.merge0Offset += offset;
            }
        },
        goToPrevMerge1Plane() {
            let offset = 1;
            if(this.doInBetween1 && this.doBlend) { // in-betweening will only render evey other frame, so we need to skip one
                offset = 2;
            }
            if(this.merge1Offset > this.blendOffset) {
                this.merge1Offset -= offset;
                if(this.doBlend) { // syncronize if in blend mode
                    this.merge0Offset -= offset;
                }
            }
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
        setInitValues() {
            // reset the values
            this.doMerge0 = false;
            this.doMerge1 = false;
            this.blendOffset = 1;
            this.merge0Offset = 2;
            this.merge1Offset = 3;
        },
        exportCurrentFrame(planeToExport) {
            let image = this.mainImage();
            let index = this.planeIndices.current;
            if(planeToExport == 1) {
                image = this.blendImge();
                index = this.planeIndices.blend;
            }
            if(this.exportOption == 0) { // png export is handled within the main dmd component:
                this.$refs.main.downloadPng();
            } else if(this.exportOption == 3) { // raw daya array export
                let dataString =  MainStore.exportAsDataArray(image);
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
                const bmp = MainStore.exportAs1bitBmp(image,inverted,128,32);
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
.in-between {
    margin-top: var(--space-sm);
    margin-bottom: var(--space-md);
}
</style>