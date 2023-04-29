<template>
  <TopBar :showBackButton="!isAtHomeView" :title="viewTitle"/>
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition">
        <component :is="Component" @modal="openModal" />
      </transition>
    </router-view>
</template>

<script>
import TopBar from './components/ui/TopBar.vue';
import store from "./stores/store.js";
import { storeToRefs } from 'pinia';
import { useMainStore } from './stores/mainStore.js';

const MainStore = useMainStore(store);

export default {
  name: 'App',
  components: {
    TopBar
  },
  props: {
  },
  setup() {
    const { viewTitle, isAtHomeView, romIsLoaded, currentRomData } = storeToRefs(MainStore);
    return {
      viewTitle,
      isAtHomeView,
      romIsLoaded,
      currentRomData
    }
  },
  data() {
    return {
      showFullFrameModal: false,
      showSpriteModal: false,
      modalProps: {
        index: 0,
        table: 0
      }
    }
  },
  methods: {
    openModal(value) {
      if(value.type == "full") {
        this.showFullFrameModal = true;
        this.modalProps.index = value.index;
      }
      if(value.type == "sprite") {
        this.showSpriteModal = true;
        this.modalProps.index = value.index;
        this.modalProps.table = value.table;
      }

    }
  },
  mounted() {
    // restore rom data from cache:
    if( this.romIsLoaded && this.currentRomData == null ) {
      this.$router.push('/wpcedit'); // force back to main page, because the data has not been loaded yet
      MainStore.getRomFromCache();
    }
  }
}

</script>

<style>
  @import './assets/variables.css';
  @import './assets/graphics.css';
  @import url('https://fonts.googleapis.com/css2?family=Inria+Sans:wght@300;400;700&display=swap');

  html {
    font-size: 62.5%;
    font-family: 'Inria Sans', sans-serif;
  } 
  
  body {
    background: var(--grey2);
    overflow: hidden;
  }

  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .scroll-area {
    position: absolute;
    top: 6rem;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
  }

  .headline {
    font-weight: 700;
    font-size: var(--text-lg);
    color: var(--grey9);
    margin: var(--space-md) 0;
  }

  .body-sm {
    font-weight: 400;
    font-size: var(--text-sm);
    line-height: var(--text-leading-sm);
    color: var(--grey9);
    width: 100%;
    margin: 0;
    margin-bottom: var(--space-md);
    max-width: 66rem;
  }
  
  .label-md {
    font-weight: 700;
    font-size: var(--text-md);
    line-height: var(--text-leading-sm);
    color: var(--grey9);
    margin: 0;
  }
  .label-sm {
    font-weight: 300;
    font-size: var(--text-sm);
    line-height: var(--text-leading-sm);
    color: var(--grey9);
    margin: 0;
  }
  .text-accent {
    color: var(--accent);
  }

  .main-container {
    position: absolute;
    width: 100%;
    max-width: 102rem;
    top: 6rem;
    left: 50%;
    transform: translate(-50%, 0);
  }
  .content-wrapper {
    margin: 0 var(--space-md);
  }

  hr {
    border-style: solid;
    border-color: var(--grey7);
    margin: var(--space-lg) 0;
  }

  a {
    color: var(--accent);
  }

  .fade-enter-active {
    transition: all 1s ease-out;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  @media screen and (max-width: 860px) {
    .scroll-area {
      top: 9rem;
    }
  }
</style>


