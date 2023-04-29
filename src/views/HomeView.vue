<template>
  <div class="scroll-area">
    <div class="main-container">
¨    <div v-if="romIsLoaded" class="navigation">
        <FeatureButton icon="fullframe" @click="this.$router.push('wpcedit/fullframe')">Full frame graphics</FeatureButton>
        <FeatureButton icon="sprites" @click="this.$router.push('wpcedit/sprites')">Sprites and fonts</FeatureButton>
        <FeatureButton icon="checksum" @click="this.$router.push('wpcedit/checksum')">Checksum tool</FeatureButton>
        <FeatureButton icon="settings" @click="this.$router.push('wpcedit/settings')">Settings</FeatureButton>
    </div>

    <FileDrop v-if="!romIsLoaded" @loaded="loadRom"></FileDrop>
  </div>

    <AlertDialog :show="showError" title="Error">
      <p class="body-sm">{{ errorMessage }}</p>
      <div class="alert-footer">
        <StandardButton type="primary" @click="okClicked" class="alert-ok-btn">OK</StandardButton>
      </div>
    </AlertDialog>
    <DisclaimerModal :show="showDisclaimer" @agree="agreeClicked" @disagree="disagreeClicked"></DisclaimerModal>

  </div>
</template>
  
<script>
    import FileDrop from '../components/ui/FileDrop.vue';
    import FeatureButton from '../components/ui/buttons/FeatureButton.vue';
    import DisclaimerModal from '../components/ui/modals/DisclaimerModal.vue';
    import AlertDialog from '../components/ui/modals/AlertDialog.vue';
    import StandardButton from '../components/ui/buttons/StandardButton.vue';
    import store from "../stores/store.js";
    import { useMainStore } from '../stores/mainStore.js';
    import { storeToRefs } from 'pinia';

    const MainStore = useMainStore(store);

    export default {
      name: 'HomeView',
      components: {
        FileDrop,
        FeatureButton,
        DisclaimerModal,
        AlertDialog,
        StandardButton
      },
      props: {
      },
      data() {
          return {
            showDisclaimer: false,
            tempFile: null,
            showError: false,
            errorMessage: ''
          }
      },
      setup() {
        const { romIsLoaded, warnings } = storeToRefs(MainStore);
        return {
          romIsLoaded,
          warnings
        }
      },
      beforeRouteEnter() {
        if(!MainStore.romIsLoaded) {
          MainStore.setViewTitle("Load ROM");
        } else {
          MainStore.setViewTitle("Home");
        }
        MainStore.isAtHomeView = true;
      },
      updated() {
        if(!MainStore.romIsLoaded) {
          MainStore.setViewTitle("Load ROM");
        } else {
          MainStore.setViewTitle("Home");
        }
      },
      methods: {
        agreeClicked() {
          if(this.tempFile != null) {
            this.loadRom(this.tempFile);
          }
          this.warnings.load++;
          this.showDisclaimer = false;
        },
        disagreeClicked() {
          this.tempFile = null;
          MainStore.unloadRom();
          this.showDisclaimer = false;
        },
        okClicked() {
          this.showError = false;
        },
        loadRom(file) {
          const reader = new FileReader();
          reader.addEventListener("loadend", () => {
            if(reader.result) {
              const bytes = new Uint8Array(reader.result);
              const result = MainStore.loadRom(bytes, file.name);
              if(result.error) {
                this.errorMessage = result.msg;
                this.showError = true;
                MainStore.unloadRom();
              } else {
                if(this.warnings.load < 1) {
                  // if a warning is triggered, the file is stored in a temp variable until we know it is OK to use it
                  this.tempFile = file;
                  this.showDisclaimer = true;
                }
              }
            }
          });
          reader.readAsArrayBuffer(file);
        },
      }
    }
  
  </script>
  
  <style scoped>
  .navigation {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: var(--space-xl);
  }
  .navigation a {
    text-decoration: none;
  }
  .alert-ok-btn {
    width: 12rem;
    margin: 0 auto;
  }
  </style>