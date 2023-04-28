<template>
    <div class="scroll-area">
      <div class="main-container">
        <div class="content-wrapper">
        <PaginationBlock v-if="settings.dmdsPerPage>0" class="pagination" @next="nextPage" @prev="prevPage" @start="startPage"></PaginationBlock>
        <div class="fullframe-list" :key="currPage">
          <FullFrameItem v-for="n in pageLength" :image="getFrame(n-1)" :key="n" :index="n-1" @open="openModal"></FullFrameItem>
        </div>
      </div>
    </div>
      <FullFrameModal :show="showModal" @close="showModal = false" :index="activeIndex"></FullFrameModal>
    </div>
  </template>
  
  <script>
    import FullFrameModal from '../components/ui/modals/FullFrameModal.vue';
    import PaginationBlock from '../components/ui/PaginationBlock.vue';
    import store from "../stores/store.js";
    import { storeToRefs } from 'pinia';
    import { useMainStore } from '../stores/mainStore.js';
    import { defineAsyncComponent } from 'vue'
    
    const MainStore = useMainStore(store);

  export default {
    name: 'FullFrameView',
    components: {
        FullFrameItem : defineAsyncComponent(() =>
          import('../components/ui/list-items/FullFrameItem.vue')
        ),
        PaginationBlock,
        FullFrameModal
    },
    props: {
      
      },
    setup() {
      const { maxFullFrameIndex, settings } = storeToRefs(MainStore);
      return {
        maxFullFrameIndex,
        settings,
      }
    },
    data() {
        return {
          activeIndex: 0,
          currPage: 0,
          showModal: false
          }
    },
    computed: {
      pageLength() {
        const setting = Number(this.settings.dmdsPerPage);
        if(setting == 0) {
          return this.maxFullFrameIndex;
        } else {
          if(setting == 1) { 
            // these values are also hardcoded in the settings view:
            return 16;
          } else if(this.settings.dmdsPerPage == 2) {
            return 24;
          } else {
            return 32;
          }
        }
      }
    },
    methods: {
      openModal(index) {
        const offset = this.currPage*this.pageLength;
        index += offset;
        this.activeIndex = index;
        this.showModal = true
      },
      getFrame(index) {
        const offset = this.currPage*this.pageLength;
        index += offset;
        return MainStore.getFullFrameImageAt(index).image;
      },
      nextPage() {
        this.currPage++;
      },
      prevPage() {
        this.currPage = Math.max(0,this.currPage-1);
      },
      startPage() {
        this.currPage = 0;
      }
    },
    beforeRouteEnter() {
      MainStore.setViewTitle("Full frame graphics");
      MainStore.isAtHomeView = false;
    }
  }
  
  </script>
  
  <style scoped>
   .fullframe-list {
    display: grid;
    gap: var(--space-md);
    grid-template-columns: 1fr 1fr 1fr 1fr;
    margin-bottom: var(--space-lg);
    justify-content: center;
  }
  @media screen and (max-width: 1024px) {
    .fullframe-list {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }
  @media screen and (max-width: 768px) {
    .fullframe-list {
      grid-template-columns: 1fr 1fr;
    }
  }
  @media screen and (max-width: 520px) {
    .fullframe-list {
      grid-template-columns: 1fr;
    }
  }
  </style>
  
  
  