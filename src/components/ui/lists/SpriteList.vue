<template>
    <div class="sprite-list">
        <p class="label-md table-header">Table {{ tableIndex }}</p>
        <SpriteItem v-for="n in table" :image="getFrame(n)" :key="n" :index="n" :tableIndex="tableIndex" @open="openModal"></SpriteItem>
    </div>
</template>

<script>
import { useMainStore } from '../../../stores/mainStore.js';
import { defineAsyncComponent } from 'vue'
import store from "../../../stores/store.js";

const MainStore = useMainStore(store);

export default {
  name: 'SpriteList',
  components: {
    SpriteItem : defineAsyncComponent(() =>
          import('../list-items/SpriteItem.vue')
        ),
  },
  props: {
    show: Boolean,
    table: Array,
    tableIndex: Number,
    tableAddress: String
  },
  data() {
    return {
    }
  },
  methods: {
    openModal(event) {
        this.$emit('openModal',{index:event.index,tableIndex:event.tableIndex});
      },
    getFrame(index) {
        return MainStore.getSpriteCentered(this.tableIndex,index);
      }
  }
}
</script>

<style scoped>
.sprite-list {
    border: 0.1rem solid var(--grey7);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    max-width: 102rem;
    display: grid;
    gap: var(--space-md);
    grid-template-columns: 1fr 1fr 1fr 1fr;
    margin-bottom: var(--space-lg);
}

.table-header {
  width: 100%;
  color: var(--grey7);
  grid-column-end: span 4;
}
@media screen and (max-width: 1024px) {
    .sprite-list {
      grid-template-columns: 1fr 1fr 1fr;
    }
    .table-header {
      grid-column-end: span 3;
    }
  }
  @media screen and (max-width: 768px) {
    .sprite-list {
      grid-template-columns: 1fr 1fr;
    }
    .table-header {
      grid-column-end: span 2;
    }
  }
  @media screen and (max-width: 570px) {
    .sprite-list {
      grid-template-columns: 1fr;
    }
    .table-header {
      grid-column-end: span 1;
    }
  }

</style>