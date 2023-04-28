<template>
    <div class="scroll-area">
        <div class="main-container">
            <div class="content-wrapper">
                <div class="info-container">
                    <p v-if="checksumIsValid && fixupBytes!='00FF'" class="label-md text-accent status-msg"><LargeIcon type="check"></LargeIcon> The checksum in this ROM is valid</p>
                    <p v-if="!checksumIsValid && fixupBytes!='00FF'" class="label-md text-accent status-msg" ref="invalid"><LargeIcon type="warning"></LargeIcon> The checksum in this ROM is invalid</p>
                    <p v-if="fixupBytes=='00FF'" class="label-md text-accent status-msg" ref="invalid"><LargeIcon type="info"></LargeIcon> The checksum has been disabled in this ROM</p>
                    <div class="info-row">
                        <div class="info-col">
                            <p class="label-sm">Current checksum</p>
                            <p class="label-md">{{ storedChecksum }}</p>
                        </div>
                        <div class="info-col">
                            <p class="label-sm">Fixup bytes</p>
                            <p class="label-md">{{ fixupBytes }}</p>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-col">
                            <p class="label-sm">Calculated checksum</p>
                            <p class="label-md">{{ calculatedChecksum }}</p>
                        </div>
                        <div class="info-col">
                            <p class="label-sm">Version byte</p>
                            <p class="label-md">{{ versionByte }}</p>
                        </div>
                    </div>
                </div>
                <p class="headline">Calculate and update checksum</p>
                <p class="body-sm">Use this tool to calculate and set new valid checksum and fixup bytes of a modified WPC ROM. The checksum is caluculated from a sum of all the bytes in the ROM and consists of two bytes, of which the last byte represents the game version. The fixup bytes can be any value that makes the checksum match.</p>
                <p class="headline">Desired game version:</p>
                <div class="checksum-form">
                    <NumeralInput size="large" :value="Number(this.versionByte)" :maxlength="2" :min="1" :max="99" class="version-input" ref="version" @change="updateInput"></NumeralInput>
                    <StandardButton size="large" type="primary" @click="updateChecksum(value)">Update checksum</StandardButton>
                </div>
                <p class="label-md text-accent feedback-msg" :class="checksumFeedbackClass" ref="checksumFeedback">{{ checksumFeedbackMsg }}</p>
                <hr/>
                <p class="headline">Disable checksum</p>
                <p class="body-sm">The checksum may be temporarily disabled while debugging ROM. This is done by setting the fixup bytes to 0xFF00. This will also remove other startup tests. Once the modified ROM is ready, you should always insert a correct checksum using the tool above so that the game will alert you about any errors.</p>
                <StandardButton size="large" type="primary" @click="disableChecksum()">Disable checksum</StandardButton>
                <p class="label-md text-accent feedback-msg" :class="disableFeedbackClass" ref="disableFeedback">{{ disableFeedbackMsg }}</p>
            </div>
        </div>
    </div>
</template>

<script>
    import StandardButton from '../components/ui/buttons/StandardButton.vue'
    import NumeralInput from '../components/ui/inputs/NumeralInput.vue'
    import LargeIcon from '../components/icons/LargeIcon.vue'
    import store from "../stores/store.js";
    import { useMainStore } from '../stores/mainStore.js';
    import { storeToRefs } from 'pinia';

    const MainStore = useMainStore(store);

    export default {
      name: 'ChecksumView',
      components: {
        StandardButton,
        NumeralInput,
        LargeIcon
      },
      props: {
      },
      data() {
          return {
            inputVal: Number(this.versionByte),
            checksumFeedbackClass: 'hidden',
            disableFeedbackClass: 'hidden',
            checksumFeedbackMsg: '',
            disableFeedbackMsg: ''
          }
      },
      setup() {
        const { romIsLoaded, romIsAltered, storedChecksum, calculatedChecksum, fixupBytes, versionByte, checksumIsValid } = storeToRefs(MainStore);
        return {
            romIsLoaded, romIsAltered, storedChecksum, calculatedChecksum, fixupBytes, versionByte, checksumIsValid
        }
      },
      beforeRouteEnter() {
        MainStore.setViewTitle("Checksum tool");
        MainStore.isAtHomeView = false;
      },
      methods: {
        updateChecksum() {
            const newVersion = this.inputVal;
            this.checksumFeedbackClass = 'hidden';
            setTimeout(() => { // we could do this instantly but the delay creates a sense of something processing
                const result = MainStore.updateChecksum(newVersion);
                if(result == 1) {
                    this.checksumFeedbackMsg = 'The checksum was successfully updated!';
                } else if (result == 0) {
                    this.checksumFeedbackMsg = 'The version byte matches the current checksum, no need to update';
                } else {
                    this.checksumFeedbackMsg = 'Was not able to figure out a new checksum :(';
                }
                this.checksumFeedbackClass = 'show';
            }, 500);
        },
        disableChecksum() {
            this.disableFeedbackClass = 'hidden';
            setTimeout(() => { // we could do this instantly but the delay creates a sense of something processing
                if (MainStore.disableChecksum() == 1) {
                    this.disableFeedbackMsg = 'The checksum is now disabled.';
                } else {
                    this.disableFeedbackMsg = 'An error occured while trying to disable.';
                }
                this.disableFeedbackClass = 'show';
            }, 500);
        },
        updateInput(event) {
            this.inputVal = event.target.value;
        }
      }
    }
  </script>

<style scoped>
.info-container {
    padding: var(--space-md);
    width: calc(100% - 2*var(--space-md));
    max-width: 49rem;
    border: 1px solid var(--grey7);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-lg);
}
.info-row {
    display: flex;
    flex-direction: row;
    margin-top: var(--space-md);
}
.info-col {
    width: 50%;
}
.checksum-form {
    display: flex;
    flex-direction: row;
}
.version-input {
    width: 18rem;
    margin-right: var(--space-md);
}
.status-msg {
    display: flex;
    align-items: center;
}
.status-msg .icon {
    margin-right: var(--space-sm);
    background-color: var(--accent);
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
</style>