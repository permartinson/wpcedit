<template>
    <div class="scroll-area">
        <div class="main-container">
            <div class="content-wrapper">
                <div class="settings-container">
                    <div class="setting">
                    <p class="headline">Display style</p>

<MainDmd :image0="image0" :image1="image1" :index="0" :key="settings.displayStyle" ref="main"></MainDmd>

<SelectInput name="dmdstyle" :options="dmdOptions" @change="setDmdStyle" class="dmd-style-select"></SelectInput>
</div>
<div class="setting">
<p class="headline">Make in-betweening optional</p>
<p class="body-sm">Some DMD encodings in WPC rely on previous frames to render completely. In those cases you may check "Apply image X on top" in the full frame image. Per default, WPC Edit also renders all the frames in between the base frame and your selected merge frame to get a proper composition. If you want to experiment on your own, you may make in-betweening optional by turning off the setting below:</p>
<CheckBox class="in-between" @change="setIntbetween" :checked="settings.optionalInbetweening" label="Add option for in-between" ref="inBetween"></CheckBox>
</div>
<div class="setting">

<p class="headline">DMD graphics per page</p>
<p class="body-sm">Rendering many DMD images at once can be perfomance-intense. If you experience issues, you may reduce the amount of DMD images per page in the Full Frame and Sprite listings.</p>
<SelectInput name="perpage" :options="paginationOptions" @change="setPagination" class="pagination-select"></SelectInput>
</div>
<div class="setting">

<p class="headline">Warning messages</p>
<p class="body-sm">You may reset all warning messages in WPC Edit to see them again.</p>
<StandardButton size="small" @click="resetWarnings()">Reset all warning messages</StandardButton>
<p class="label-md text-accent feedback-msg" :class="warningsFeedbackClass" ref="disableFeedback">{{ warningsFeedbackMsg }}</p>
</div>

                </div>
            <hr/>
            <p class="headline">About WPC Edit</p>
            <p class="body-sm">WPC Edit was first developed and released in 2004 by Garrett Lee as a Windows app. In 2023, Per Martinson took on the challange to transition the code base to Javascript and turn it into a web app. All the code is open source, and published at <a target="_blank" href="https://github.com/permartinson/wpcedit">https://github.com/permartinson/wpcedit</a>. Please help out by submitting any bugs you might find.</p>
            </div>
        </div>
    </div>
</template>

<script>
    import StandardButton from '../components/ui/buttons/StandardButton.vue';
    import MainDmd from '../components/dmd/MainDmd.vue';
    import SelectInput from '../components/ui/inputs/SelectInput.vue';
    import CheckBox from '../components/ui/CheckBox.vue';
    import store from "../stores/store.js";
    import { useMainStore } from '../stores/mainStore.js';
    import { storeToRefs } from 'pinia';
    const MainStore = useMainStore(store);

    export default {
      name: 'SettingsView',
      components: {
        StandardButton,
        MainDmd,
        SelectInput,
        CheckBox
      },
      props: {
      },
      data() { 
        const image0 = Uint8Array.from([
        0x00,0x00,0x00,0x00,0x80,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x80,0x01,0x00,0x80,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xC0,0x03,0x00,0xC0,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xC0,0x07,0xF8,0xFF,0xFF,0x1F,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xC0,0x0F,0x00,0xC0,0x1F,0x78,0xFE,0x01,0x78,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xE0,0x1F,0x00,0x80,0x1E,0x78,0xFE,0x07,0xFE,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0xFC,0xFF,0x00,0x80,0x1E,0x78,0xFE,0x0F,0xFF,0x03,0x00,0x00,0x00,0x00,0x00,0x00,0xFE,0xFF,0x01,0x80,0x1E,0x78,0xFE,0x0F,0xFF,0x03,0x00,0x00,0x00,0x00,0x00,0x00,0xFF,0xC3,0x03,0x80,0x1E,0x78,0x1E,0x9E,0x87,0x07,0x00,0x80,0x01,0x00,0x00,0x00,0xFE,0x81,0x07,0x00,0x1E,0x78,0x1E,0x9E,0x87,0x07,0x00,0x80,0x11,0x00,0x00,0x00,0xFC,0x03,0x0F,0x00,0x1E,0x78,0x1E,0x9E,0x87,0x07,0x00,0xC0,0x10,0x08,0x00,0x00,0xF8,0x07,0x1E,0x00,0x1E,0x78,0x1E,0x9E,0x07,0x00,0x00,0xC0,0x38,0x00,0x00,0x00,0xF1,0x0F,0x3C,0x00,0x1E,0x78,0x1E,0x9E,0x07,0x00,0x0F,0xFC,0xFF,0x7F,0x00,0x00,0xE1,0x1F,0x7C,0x00,0x1E,0x78,0x1E,0x9E,0x07,0x80,0x19,0x06,0x38,0x00,0x00,0x00,0xC5,0x3F,0xFC,0x00,0x9E,0x79,0xFE,0x8F,0x07,0xC0,0x98,0x61,0x10,0x06,0x00,0x00,0x84,0x7F,0xFC,0x01,0x9E,0x79,0xFE,0x8F,0x07,0xC0,0x98,0x61,0x18,0x06,0x00,0x00,0x14,0xFF,0xFE,0x03,0x9E,0x79,0xFE,0x87,0x07,0x60,0xD8,0x60,0x08,0x06,0x00,0x00,0x10,0xFE,0xFF,0x07,0x9E,0x79,0xFE,0x81,0x07,0x60,0xCE,0x20,0x08,0x02,0x00,0x00,0x50,0xFC,0xFF,0x0F,0xDE,0x7B,0x1E,0x80,0x07,0xE0,0xC7,0x30,0x0C,0x03,0x00,0x00,0x40,0xF8,0xFF,0x1F,0xDE,0x7B,0x1E,0x80,0x07,0x60,0xC0,0x30,0x0C,0x43,0x00,0x00,0x40,0xF1,0xFF,0x3F,0xFE,0x7F,0x1E,0x80,0x87,0x67,0xC0,0x30,0x8E,0x43,0x00,0x00,0x00,0xE1,0xFF,0x7B,0x7E,0x7E,0x1E,0x80,0x87,0x47,0xB0,0x38,0x4D,0x27,0x00,0x00,0x00,0xC5,0xFF,0x71,0x7E,0x7E,0x1E,0x80,0x87,0x87,0x0F,0xE7,0x38,0x1E,0x00,0x00,0x00,0x84,0xFF,0x20,0x3E,0x7C,0x1E,0x00,0xFF,0x03,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x14,0x7F,0x00,0x3E,0x7C,0x1E,0x00,0xFF,0x03,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x10,0x3E,0x00,0x1E,0x78,0x1E,0x00,0xFE,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x50,0x1C,0xFC,0x1E,0x78,0x9E,0x7F,0x78,0xF8,0xFF,0xFF,0xFF,0xFF,0x01,0x00,0x00,0x40,0x08,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x40,0x01,0x00,0x1E,0x78,0x00,0x00,0x78,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        ]);

        const image1 = Uint8Array.from([
        0x00,0x80,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xC0,0x02,0x00,0x80,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x60,0x04,0x00,0x80,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x20,0x88,0x87,0xFF,0xFF,0xE1,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x20,0x10,0x00,0x80,0x00,0x78,0xFE,0x01,0x78,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x1C,0x20,0x00,0x80,0x1F,0x78,0xFE,0x07,0xFE,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x06,0x40,0x00,0x80,0x1F,0x78,0xFE,0x0F,0xFF,0x03,0x00,0x00,0x00,0x00,0x00,0x00,0x03,0xE0,0x00,0x00,0x1F,0x78,0xFE,0x0F,0xFF,0x03,0x00,0xC0,0x03,0x00,0x00,0x80,0x01,0xFC,0x01,0x00,0x1E,0x78,0x1E,0x9E,0x87,0x07,0x00,0xC0,0x13,0x00,0x00,0x80,0x01,0x82,0x03,0x80,0x1E,0x78,0x1E,0x9E,0x87,0x07,0x00,0xC0,0x03,0x18,0x00,0x80,0x03,0x00,0x07,0x80,0x1E,0x78,0x1E,0x9E,0x87,0x07,0x00,0xE0,0x31,0x1C,0x00,0x80,0x07,0x00,0x0E,0x00,0x1E,0x78,0x1E,0x9E,0x07,0x00,0x0F,0x20,0x51,0x1F,0x00,0x00,0x0E,0x00,0x1E,0x00,0x1E,0x78,0x1E,0x9E,0x07,0x80,0x1F,0xE3,0xFF,0x8F,0x03,0x00,0x1F,0x00,0x3A,0x00,0x1E,0x78,0x1E,0x9E,0x07,0xC0,0xBF,0xFF,0x15,0x0F,0x00,0x00,0x39,0x00,0x72,0x00,0x9E,0x79,0xFE,0x8F,0x07,0xE0,0xFD,0xF3,0x3C,0x07,0x00,0x00,0x7C,0x00,0xE2,0x00,0x9E,0x79,0xFE,0x8F,0x07,0xE0,0xFD,0xF3,0x24,0x07,0x00,0x00,0xE4,0x00,0xC1,0x01,0x9E,0x79,0xFE,0x87,0x07,0xF0,0xFE,0xF1,0x3C,0x07,0x00,0x00,0xF0,0x01,0x80,0x03,0x9E,0x79,0xFE,0x81,0x07,0xF0,0xFF,0x71,0x1C,0x07,0x00,0x00,0x90,0x03,0x00,0x07,0xDE,0x7B,0x1E,0x80,0x07,0xF0,0xEF,0x79,0x9E,0x47,0x00,0x00,0xC0,0x07,0x00,0x0E,0xDE,0x7B,0x1E,0x80,0x07,0xF0,0xE7,0x79,0x9E,0xE7,0x00,0x00,0x40,0x0E,0x00,0x1C,0xFE,0x7F,0x1E,0x80,0x87,0xF7,0xF0,0x79,0xDF,0xE7,0x00,0x00,0x00,0x1F,0x00,0x3C,0x7E,0x7E,0x1E,0x80,0x87,0xE7,0xFF,0xFF,0xFF,0x7F,0x00,0x00,0x00,0x39,0x00,0x7F,0x7E,0x7E,0x1E,0x80,0x87,0xC7,0xBF,0xFF,0x7D,0x3F,0x00,0x00,0x00,0x7C,0x80,0x27,0x3E,0x7C,0x1E,0x00,0xFF,0x83,0x0F,0xE7,0x38,0x1E,0x00,0x00,0x00,0xE4,0xC0,0x03,0x3E,0x7C,0x1E,0x00,0xFF,0x03,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xF0,0xE1,0x01,0x1E,0x78,0x1E,0x00,0xFE,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x90,0xF3,0x00,0x1E,0x78,0x1E,0x00,0x78,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xC0,0x7F,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x40,0x3E,0xFF,0xE1,0x87,0xFF,0xFF,0x87,0xFF,0xFF,0xFF,0xFF,0x7F,0x00,0x00,0x00,0x00,0x1F,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xCD,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0x1F,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        ]);

        // fetch the selected export option and create an object to pass the data for the selector
        const dmdOptions = new Array();
        const dmdLabels = [
            'Simulated plasma display',
            'Orange dots',
            'Orange squares',
            'White dots',
            'White squares'
        ]
        for(let i=0;i<dmdLabels.length;i++) {
            const selected = (i == this.settings.displayStyle);
            dmdOptions.push({value:i,label:dmdLabels[i],selected:selected})
        }
        const paginationOptions = new Array();
        const paginationLabels = [
            // these values are also hardcoded in the settings view (would be nice to store at a global place):
            'Infinite',
            '16 full frames / 1 sprite table',
            '24 full frames / 1 sprite table',
            '32 full frames / 1 sprite table'
        ]
        for(let i=0;i<paginationLabels.length;i++) {
            const selected = (i == this.settings.dmdsPerPage);
            paginationOptions.push({value:i,label:paginationLabels[i],selected:selected})
        }
        return {
            inputVal: Number(this.versionByte),
            warningsFeedbackClass: 'hidden',
            warningsFeedbackMsg: '',
            image0: image0,
            image1: image1,
            dmdOptions: dmdOptions,
            paginationOptions: paginationOptions
          }
      },
      setup() {
        const { settings } = storeToRefs(MainStore);
        return {
            settings
        }
      },
      beforeRouteEnter() {
        MainStore.setViewTitle("Settings");
        MainStore.isAtHomeView = false;
      },
      methods: {
        setDmdStyle(event) {
            if(event.value != undefined) {
                this.settings.displayStyle = event.value;
            }
        },
        setIntbetween(state) {
            if(state == true) {
                this.settings.optionalInbetweening = true;
            } else if(state == false) {
                this.settings.optionalInbetweening = false;
            }
        },
        setPagination(event) {
            if(event.value != undefined) {
                this.settings.dmdsPerPage = event.value;
            }
        },
        resetWarnings() {
            this.disableFeedbackClass = 'hidden';
            MainStore.resetWarnings();
            setTimeout(() => { // the delay is just to give a sense of process, just like the checksum view
                this.warningsFeedbackMsg = 'All errors has been reset and will now appear again.';
                this.warningsFeedbackClass = 'show';
            }, 500);
        }
      }
    }
  </script>

<style scoped>
.dmd-style-select {
    width: 30rem;
}
.pagination-select {
    width: 12rem;
}
.feedback-msg {
    margin-top: var(--space-sm);
    opacity: 1;
    transition: opacity 1s;
}
.feedback-msg.hidden {
    opacity: 0;
    transition: opacity 0.2s;
}
.settings-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
}
.headline {
    margin: 0;
    margin-bottom: var(--space-md);
}
.setting {
    border: 0.1rem solid var(--grey7);
    border-radius: var(--radius-md);
    padding: var(--space-md);

}
@media screen and (max-width: 768px) {
    .settings-container {
        grid-template-columns: 1fr;
    }
  }

</style>