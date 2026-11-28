<template>
    <div class="scroll-area">
      <div class="main-container">
        <div class="content-wrapper">
        <PaginationBlock v-if="settings.dmdsPerPage>0" class="pagination" @next="nextPage" @prev="prevPage" @start="startPage"></PaginationBlock>
        <div class="fullframe-list" :key="currPage">
          <FullFrameItem v-for="n in pageLength" v-bind="getFrame(n-1)" :key="n" :index="n-1" @open="openModal"
            :tabbable="n <= tabLimit"></FullFrameItem>
        </div>
        <MoreInTabOrder :shown="tabLimit" :total="pageLength" what="images" @more="showMoreInTabOrder('.list-item-fullframe')"></MoreInTabOrder>
      </div>
    </div>
      <FullFrameModal :show="showModal" @close="showModal = false" :index="activeIndex"></FullFrameModal>
    </div>
  </template>
  
  <script>
    import FullFrameModal from '../components/ui/modals/FullFrameModal.vue';
    import PaginationBlock from '../components/ui/PaginationBlock.vue';
    import MoreInTabOrder, { tabStep } from '../components/ui/MoreInTabOrder.vue';
    import { toHex } from '../helpers/formatting.js';
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
        FullFrameModal,
        MoreInTabOrder
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
          showModal: false,
          // Only this many images are reached with Tab, see MoreInTabOrder
          tabLimit: tabStep
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
    watch: {
      currPage() {
        this.tabLimit = tabStep;
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
        // Read image and type at once: the library reuses one plane object.
        const plane = MainStore.getFullFrameImageAt(index);
        return {
          image: plane.image,
          label: `Full frame image ${index}, encoding ${toHex(plane.type)}`
        };
      },
      nextPage() {
        this.currPage++;
      },
      prevPage() {
        this.currPage = Math.max(0,this.currPage-1);
      },
      startPage() {
        this.currPage = 0;
      },
      showMoreInTabOrder(selector) {
        const first = this.tabLimit;
        this.tabLimit += tabStep;
        this.$nextTick(() => this.$el.querySelectorAll(selector)[first]?.focus());
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
  
  
  