<template>
    <div class="scroll-area">
        <div class="main-container" :key="currPage">
          <div class="content-wrapper">
          <PaginationBlock v-if="settings.dmdsPerPage>0" class="pagination" @next="nextPage" @prev="prevPage" @start="startPage"></PaginationBlock>
            <SpriteList v-for="(table, index) in tableMap" :key="tableIndex(table.index)" :table="table" :table-index="tableIndex(index)" @openModal="openModal">
              Sprite
            </SpriteList>
          </div>
      </div>
      <SpriteModal :show="showModal" @close="showModal = false" :index="activeIndex" :table="activeTable"></SpriteModal>
    </div>
  </template>
  
  <script>
    import SpriteList from '../components/ui/lists/SpriteList.vue';
    import PaginationBlock from '../components/ui/PaginationBlock.vue';
    import SpriteModal from '../components/ui/modals/SpriteModal.vue';
    import store from "../stores/store.js";
    import { storeToRefs } from 'pinia';
    import { useMainStore } from '../stores/mainStore.js';
    
    const MainStore = useMainStore(store);

  export default {
    name: 'SpritesView',
    components: {
        SpriteList,
        PaginationBlock,
        SpriteModal
    },
    props: {
      
      },
    setup() {
      const { spriteTableMap, settings } = storeToRefs(MainStore);
      return {
        spriteTableMap,
        settings
      }
    },
    data() {
        return {
          plane0: new Uint8Array([
            0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  240,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  254,  7,  128,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  128,  255,  15,  192,  0,  0,  224,  192,  1,  0,  0,  0,  0,  0,  0,  0,  192,  15,  31,  224,  0,  0,  240,  224,  1,  0,  0,  0,  0,  0,  0,  0,  224,  1,  30,  112,  0,  0,  120,  240,  0,  0,  0,  0,  0,  0,  0,  0,  240,  8,  30,  120,  0,  0,  124,  248,  0,  0,  0,  0,  0,  0,  0,  0,  120,  24,  62,  124,  48,  3,  60,  120,  48,  0,  0,  0,  0,  0,  0,  0,  60,  24,  62,  60,  184,  7,  62,  124,  120,  0,  0,  0,  0,  0,  0,  0,  28,  28,  63,  62,  156,  5,  30,  60,  88,  0,  0,  0,  0,  0,  0,  0,  14,  28,  31,  31,  142,  4,  31,  62,  72,  0,  0,  0,  0,  0,  0,  0,  14,  20,  157,  31,  7,  131,  15,  31,  48,  0,  0,  0,  0,  0,  0,  0,  7,  150,  221,  159,  3,  128,  15,  31,  0,  0,  0,  0,  0,  0,  0,  8,  7,  138,  236,  205,  1,  192,  135,  15,  0,  0,  0,  0,  0,  0,  0,  28,  3,  203,  252,  238,  1,  224,  194,  5,  0,  0,  0,  0,  0,  0,  0,  14,  131,  73,  56,  254,  0,  96,  195,  6,  0,  0,  0,  0,  0,  0,  0,  7,  195,  100,  0,  119,  120,  48,  97,  2,  15,  248,  60,  56,  56,  112,  128,  7,  101,  34,  48,  35,  126,  184,  113,  195,  15,  254,  63,  126,  124,  252,  192,  7,  154,  49,  40,  49,  127,  152,  48,  225,  15,  159,  31,  127,  255,  254,  225,  7,  124,  16,  36,  144,  45,  204,  152,  241,  134,  143,  159,  255,  255,  255,  241,  14,  0,  24,  18,  136,  52,  66,  140,  88,  194,  141,  202,  250,  235,  183,  89,  10,  0,  12,  17,  200,  24,  65,  70,  72,  163,  132,  72,  53,  105,  154,  44,  10,  0,  132,  16,  36,  136,  32,  65,  12,  17,  66,  164,  130,  12,  205,  20,  27,  0,  66,  16,  36,  72,  160,  32,  134,  9,  66,  148,  130,  132,  68,  6,  115,  0,  33,  16,  66,  36,  80,  32,  129,  4,  33,  82,  65,  66,  98,  18,  65,  128,  24,  16,  66,  148,  32,  145,  132,  10,  17,  42,  33,  34,  34,  161,  33,  64,  4,  16,  65,  72,  129,  98,  10,  149,  8,  149,  16,  33,  162,  166,  16,  32,  3,  16,  65,  32,  65,  4,  9,  146,  28,  138,  8,  17,  66,  73,  8,  208,  0,  160,  128,  24,  34,  132,  144,  33,  39,  70,  136,  8,  196,  8,  6,  56,  0,  192,  0,  7,  28,  120,  96,  192,  195,  193,  135,  7,  56,  240,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
          ]),
          plane1: new Uint8Array([
            0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  240,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  158,  7,  128,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  128,  3,  0,  192,  0,  0,  224,  192,  1,  0,  0,  0,  0,  0,  0,  0,  192,  0,  0,  96,  0,  0,  48,  96,  0,  0,  0,  0,  0,  0,  0,  0,  96,  0,  0,  48,  0,  0,  24,  48,  0,  0,  0,  0,  0,  0,  0,  0,  48,  8,  0,  24,  0,  0,  12,  24,  0,  0,  0,  0,  0,  0,  0,  0,  24,  24,  0,  12,  48,  3,  4,  8,  48,  0,  0,  0,  0,  0,  0,  0,  12,  8,  0,  4,  152,  1,  6,  12,  24,  0,  0,  0,  0,  0,  0,  0,  4,  12,  0,  6,  140,  2,  2,  4,  40,  0,  0,  0,  0,  0,  0,  0,  6,  4,  0,  3,  134,  3,  3,  6,  56,  0,  0,  0,  0,  0,  0,  0,  2,  12,  130,  1,  3,  128,  1,  3,  0,  0,  0,  0,  0,  0,  0,  0,  3,  14,  194,  128,  1,  128,  0,  1,  0,  0,  0,  0,  0,  0,  0,  8,  1,  6,  99,  194,  0,  192,  128,  1,  0,  0,  0,  0,  0,  0,  0,  12,  1,  7,  51,  97,  0,  96,  193,  2,  0,  0,  0,  0,  0,  0,  0,  6,  129,  135,  199,  49,  0,  160,  64,  1,  0,  0,  0,  0,  0,  0,  0,  3,  193,  131,  255,  8,  120,  240,  224,  1,  15,  248,  60,  56,  56,  112,  128,  1,  227,  193,  207,  28,  14,  88,  176,  192,  1,  14,  7,  14,  12,  28,  192,  0,  100,  192,  199,  14,  3,  104,  208,  96,  0,  3,  0,  3,  7,  6,  96,  0,  0,  224,  195,  15,  18,  48,  96,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  224,  225,  7,  11,  60,  112,  160,  1,  2,  5,  1,  16,  64,  32,  4,  0,  240,  224,  7,  7,  62,  56,  176,  64,  3,  135,  200,  144,  97,  16,  4,  0,  120,  224,  195,  7,  31,  62,  240,  224,  129,  67,  124,  240,  48,  8,  4,  0,  60,  224,  195,  135,  31,  31,  120,  240,  129,  99,  124,  120,  56,  8,  12,  0,  30,  224,  129,  195,  143,  31,  126,  248,  192,  33,  62,  60,  28,  12,  62,  0,  7,  224,  129,  99,  223,  14,  123,  244,  224,  17,  30,  28,  28,  30,  30,  128,  3,  224,  128,  55,  126,  156,  241,  98,  240,  8,  15,  30,  28,  25,  15,  192,  0,  224,  128,  31,  62,  248,  240,  97,  224,  5,  7,  14,  188,  144,  7,  240,  0,  224,  128,  31,  62,  252,  240,  225,  230,  199,  143,  15,  252,  248,  7,  56,  0,  192,  0,  7,  28,  120,  96,  192,  195,  193,  135,  7,  56,  240,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
          ]),
          emptyPlane: new Uint8Array(512),
          activeIndex: 0,
          activeTable: 0,
          currPage: 0,
          showModal: false
      }
    },
    computed: {
      tableMap() { // Translate table map to a local, so we can paginate
        if(this.settings.dmdsPerPage > 0) {
          return [ this.spriteTableMap[this.currPage] ];
        } else {
          return this.spriteTableMap;
        }
      }
    },
    methods: {
      openModal(event) {
        this.activeIndex = event.index;
        this.activeTable = event.tableIndex;
        this.showModal = true;
      },
      getSprite(index) {
        return MainStore.getSpriteAt(1,index).image;
      },
      spriteTables() {
        return MainStore.vsImageIndexMap.length;
      },
      tableIndex(index) {
        if(this.settings.dmdsPerPage>0) {
          return this.currPage;
        } else {
          return index;
        }
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
        MainStore.setViewTitle("Sprites and fonts");
        MainStore.isAtHomeView = false;
    }
  }
  
  </script>
  
  <style scoped>

  .fullframe-list {
    display: flex;
    justify-items: left;
    flex-wrap: wrap;
    max-width: 102rem;
  }

  </style>
  
  
  