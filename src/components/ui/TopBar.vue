<template>
  <div class="bar-container">
    <div class="spacer back"><MinimalButton v-if="showBackButton" @click="goHome" size="large"><LargeIcon type="left"></LargeIcon>Back</MinimalButton></div>
    <div class="spacer title"><h1 class="bar-title">{{ title }}</h1></div>
    <div class="spacer save">
      <SaveSection :romIsLoaded="romIsLoaded" :romIsAltered="romIsAltered" :fileName="fileName" @save="download" @unload="unload">
      </SaveSection>
    </div>
      <AlertDialog :show="showAlert" title="Warning!">
        <p class="body-sm">You have made modifications to this ROM.</p>
        <p class="body-sm">Make sure you save any changes you want to keep before unload, or they will be lost!</p>
        <CheckBox @change="checkboxClicked" :checked="false" label="Don't show this warning again" ref="alertCheck"></CheckBox>
        <div class="alert-footer">
          <StandardButton type="primary" @click="cancel">Cancel</StandardButton>
          <StandardButton @click="continueClicked">Unload ROM</StandardButton>
        </div>
    </AlertDialog>
  </div>
</template>

<script>
import MinimalButton from './buttons/MinimalButton.vue';
import StandardButton from './buttons/StandardButton.vue';
import AlertDialog from '../ui/modals/AlertDialog.vue';
import CheckBox from '../ui/CheckBox.vue';
import LargeIcon from '../icons/LargeIcon.vue';
import SaveSection from './SaveSection.vue';
import store from "../../stores/store.js";
import { storeToRefs } from 'pinia';
import { useMainStore } from '../../stores/mainStore.js'

const MainStore = useMainStore(store);

export default {
    name: "TopBar",
    props: {
        title: String,
        showBackButton: Boolean
    },
    setup() {
      const { romIsLoaded, romIsAltered, fileName, warnings } = storeToRefs(MainStore);
      return {
        romIsLoaded, romIsAltered, fileName, warnings
      }
    },
    data() {
      return {
        showAlert: false,
        checkBoxIsSelected: false
      }
    },
    methods: {
      goHome() {
        this.$router.push('/wpcedit');
      },
      download() {
        MainStore.downloadRom();
      },
      cancel() {
        this.showAlert = false;
      },
      continueClicked() {
        if(this.checkBoxIsSelected) {
          this.warnings.unload++;
        }
        this.continueUnload();
      },
      checkboxClicked(state) {
        if(state == true) {
          this.checkBoxIsSelected = true;
        } else if(state == false) {
          this.checkBoxIsSelected = false;
        }
      },
      unload() {
        if(this.romIsAltered && this.warnings.unload < 1) {
          this.showAlert = true;
        } else {
          this.continueUnload();
        }
      },
      continueUnload() {
        this.showAlert = false;
        MainStore.unloadRom();
        this.$router.push('/wpcedit');
      }
    },
    components: {
    MinimalButton,
    StandardButton,
    LargeIcon,
    SaveSection,
    AlertDialog,
    CheckBox
  }
}
</script>

<style scoped>
.bar-container {
  position: fixed;
  z-index: 800;
  top: 0;
  left: 0;
  right: 0;
  height: 6rem;
  padding: 0 var(--space-lg);
  background: var(--grey1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.spacer {
  flex: 1;
  display: flex;
  justify-content: center;
}

.spacer.back {
  justify-content: left;
}
.spacer.save {
  justify-content: right;
}
.bar-title {
  font-weight: 400;
  font-size: 2.8rem;
  color: var(--grey8);
  text-align: center;
}
.alert-footer {
    display: flex;
    flex-flow: row;
    justify-content:center;
    align-items: center;
    margin-top: var(--space-lg)
}
.alert-footer button {
  margin: 0 var(--space-sm);
}
@media screen and (max-width: 860px) {
    .bar-title {
      font-size: var(--text-lg);
    }
    .bar-container {
      height: 9rem;
    }
}

</style>