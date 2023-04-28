import { defineStore } from 'pinia';
import { WPCEdit } from 'wpcedit';
import { useStorage } from '@vueuse/core';
import { set, get } from "./idb.js";
import { pad, toHex } from "../helpers/formatting.js";
import { writeBmp, mirrorBits, saveDataAsFile } from "../helpers/export.js";

export const useMainStore = defineStore('mainStore', {
    state: () => {
        return {
            romIsLoaded: useStorage('romIsLoaded',false),
            romIsAltered: useStorage('romIsAltered',false),
            viewTitle: 'WPC Edit',
            fileName: useStorage('fileName',''),
            maxFullFrameIndex: useStorage('maxFullFrameIndex',0),
            isAtHomeView: true,
            currSpriteIndex: 0,
            currSpriteTableIndex: 0,
            currentRomData: null,
            spriteTableMap: null,
            calculatedChecksum: '',
            storedChecksum: '',
            versionByte: '',
            fixupBytes: '',
            checksumIsValid: false,
            exportOption: 0,
            warnings: useStorage('warnings',  {
                load: 0,
                unload: 0,
                save: 0
            }),
            settings: useStorage('settings', {
                displayStyle: 0,
                optionalInbetweening: false,
                dmdsPerPage: 0,
            })
        }
    },
    actions: {
        setViewTitle(viewTitle) {
            this.viewTitle = viewTitle;
        },
        setRomStatus(isLoaded) {
            this.romIsLoaded = isLoaded;
        },
        getRomFromCache() {
            const cachedFileName = this.fileName;
            get('currentRomData').then(
                (value) => {
                    if (value != null) {
                        this.loadRom(value,cachedFileName);
                    }
                }
            );
        },
        loadRom(data,name) {
            WPCEdit.init();
            const result = WPCEdit.setRom(data);
            if(!result.error) {
                this.fileName = name;
                this.romIsLoaded = true;
                this.currentRomData = data;
                set('currentRomData',this.currentRomData);
                this.spriteTableMap = WPCEdit.variableSizedImage.indexMap;
                this.storedChecksum = pad(WPCEdit.checksum.stored.toString(16),4).toUpperCase();
                this.calculatedChecksum = pad(WPCEdit.checksum.calculated.toString(16),4).toUpperCase();
                this.fixupBytes = pad(WPCEdit.checksum.delta.toString(16),4).toUpperCase();
                this.versionByte = pad((WPCEdit.checksum.stored & 0xFF).toString(16),2).toString(16);
                this.checksumIsValid = WPCEdit.checksum.isValid;
                this.maxFullFrameIndex = WPCEdit.fullFrameImage.maxImageIndex;
            }
            return result;
        },
        unloadRom() {
            set('currentRomData',null);
            this.currentRomData = null;
            this.romIsLoaded = false;
            this.romIsAltered = false;
            this.spriteTableMap = null;
            this.currSpriteIndex = 0;
            this.currSpriteTableIndex = 0;
            this.currentRomData = null;
            this.spriteTableMap = null;
            this.calculatedChecksum = 0;
            this.storedChecksum = 0;
            this.versionByte = 0;
            this.fixupBytes = 0;
            this.checksumIsValid = false;
            this.maxFullFrameIndex = 0;
        },
        getFullFrameImageAt(index) {
            return WPCEdit.fullFrameImage.getPlaneAt(index);
        },
        getSpriteAt(table,index) {
            WPCEdit.variableSizedImage.table = table;
            WPCEdit.variableSizedImage.index = index;
            return WPCEdit.variableSizedImage.plane;
        },
        getSpriteCentered(table,index) {
            // used by the sprite list item
            WPCEdit.variableSizedImage.table = table;
            WPCEdit.variableSizedImage.index = index;
            const spritePlane = WPCEdit.variableSizedImage.plane
            const xOffset = Math.floor((128-spritePlane.width)/2);
            const yOffset = Math.floor((32-spritePlane.height)/2);
            const sprite = WPCEdit.variableSizedImage.placeInFullFrame(WPCEdit.variableSizedImage.plane,xOffset,yOffset)
            return sprite;
        },
        getSpriteAsFullFrame(sprite,posX,posY) {
            return sprite = WPCEdit.variableSizedImage.placeInFullFrame(sprite,posX,posY)
        },
        mergePlanes(img1,plane2) {
            return WPCEdit.fullFrameImage.mergePlanes(img1,plane2);
        },
        updateChecksum(version) {
            const result = WPCEdit.checksum.update(version);
            if(result.status == 1) { // it it went well, reload with the updated rom
                this.loadRom(result.data,this.fileName);
                this.romIsAltered = true; // the rom is now altered
            }
            return result.status;
        },
        disableChecksum() {
            const result = WPCEdit.checksum.disable();
            if(result.status == 1) { // it it went well, reload with the updated rom
                this.loadRom(result.data,this.fileName);
                this.romIsAltered = true; // the rom is now altered
            }
            return result.status;
        },
        resetWarnings() {
            this.warnings.load = 0;
            this.warnings.unload = 0;
            this.warnings.save = 0;
        },
        setExportOption(option) {
            this.exportOption = option;
        },
        exportAsDataArray(image) {
            // Mirror the bits because the DMD pixels are encoded in reverse
            for(let i=0; i<image.length; i++) {
                image[i] = mirrorBits(image[i]);
            }
            
            let dataString = '';
            for(let i=0;i<image.length;i++) {
                dataString += toHex(image[i],2) + ",";
            }
            return dataString;
        },
        exportAs1bitBmp(image,inverted,width,height) {
            // Mirror the bits because the DMD pixels are encoded in reverse
            for(let i=0; i<image.length; i++) {
                image[i] = mirrorBits(image[i]);
            }

            if(inverted) {
                for(let i=0; i<image.length; i++) {
                    image[i] = ~ image[i];
                }    
            }

            // And flip rows because they are in reverse as well
            const mirrored = new Uint8Array(image.length);
            const widthInBytes = Math.ceil(width/8);
            for(let i=0; i<height; i++) {
                const offset = i * widthInBytes;
                const destOffset = mirrored.length - widthInBytes - offset;
                const rowData = image.slice(offset,offset+widthInBytes);
                mirrored.set(rowData,destOffset);
            }
            const bmp = writeBmp(Array.from(mirrored),1,width,height);
            return bmp;
        },
        downloadRom() {
            const nameWithoutExtension = this.fileName.replace(/\.[^/.]+$/, "");
            const extension = "rom";
            const date = new Date();
            // quite a long file name, but it's nice to have something unique:
            const suffix = "_"+date.getFullYear()+""+pad(date.getMonth()+1,2)+""+pad(date.getDate(),2)+""+pad(date.getHours(),2)+""+pad(date.getMinutes(),2)+"_cs"+this.storedChecksum;
            const fileName = nameWithoutExtension + suffix + "." + extension;

            saveDataAsFile(this.currentRomData,fileName,'application/octet-stream');
        }
    },
    persist: {
        storage: localStorage
    },
})