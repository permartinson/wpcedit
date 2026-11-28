<template>
    <button type="button" class="list-item-sprite" @click="$emit('open',{index:index,tableIndex:tableIndex})" ref="target" :aria-label="spriteLabel" :tabindex="tabbable ? 0 : -1">
      <span class="list-item-inner">
        <ListDmd v-if="dmdIsVisible" :index="index" :table="tableIndex" :image="image" :worker="worker"></ListDmd>
      </span>
    </button>
</template>

<script>
import ListDmd from '../../dmd/ListDmd.vue'
import { useIntersectionObserver } from '@vueuse/core'
import { ref } from 'vue'

export default {
  name: 'SpriteItem',
  props: {
    image: Uint8Array,
    index: Number,
    // false: the item can be clicked but is skipped by Tab (see the list views)
    tabbable: { type: Boolean, default: true },
    tableIndex: Number,
    worker: Worker
  },
  components: {
    ListDmd
  },
  computed: {
    // "Sprite 0x41 (A), table 3". Fonts use ASCII codes, so the printable
    // ones are shown as the character too.
    spriteLabel() {
      const code = `0x${this.index.toString(16).toUpperCase().padStart(2, '0')}`;
      const character = this.index > 0x20 && this.index < 0x7f ? ` (${String.fromCharCode(this.index)})` : '';
      return `Sprite ${code}${character}, table ${this.tableIndex}`;
    }
  },
  data() {
    return {
      isDrawn: false
    }
  },
  setup() {
    const target = ref(null);
    const dmdIsVisible = ref(false);
    // lazy-load the dmds by only rendering when they appear on screen:
    useIntersectionObserver(
      target,
      ([{ isIntersecting }]) => {
        // only trigger the state change once:
        if(dmdIsVisible.value == false) {
          dmdIsVisible.value = isIntersecting;
          stop();
        }
      },
      {
        rootMargin: "200px",
        threshold: 0
      }
    )
    return {
      target,
      dmdIsVisible,
    }
  }
}

</script>

<style scoped>

.list-item-sprite {
  display: block;
  padding: 0;
  border: none;
  font: inherit;
  color: inherit;
  width: 100%;
  max-width: 23.5rem;
  height: 8.2rem;
  background: var(--grey5);
  border-radius: var(--radius-md);
  cursor: pointer;
  box-shadow: var(--shadow-btn-default);
  margin: 0 auto;
}

.list-item-sprite:hover {
  background: var(--grey4);
  box-shadow: var(--shadow-btn-hover);
}

.list-item-inner {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  
}

</style>