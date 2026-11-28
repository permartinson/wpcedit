<template>
    <button type="button" class="list-item-fullframe" @click="$emit('open',index)" ref="target" :aria-label="label" :tabindex="tabbable ? 0 : -1">
      <span class="list-item-inner">
        <ListDmd v-if="dmdIsVisible" :index="index" :image="image"></ListDmd>
      </span>
    </button>
</template>

<script>
import ListDmd from '../../dmd/ListDmd.vue'
import { useIntersectionObserver } from '@vueuse/core'
import { ref } from 'vue';

export default {
  name: 'FullFrameItem',
  props: {
    image: Uint8Array,
    index: Number,
    // The name a screen reader reads, for example "Full frame image 17"
    label: String,
    // false: the item can be clicked but is skipped by Tab (see the list views)
    tabbable: { type: Boolean, default: true },
  },
  components: {
    ListDmd
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

.list-item-fullframe {
  display: block;
  padding: 0;
  border: none;
  font: inherit;
  color: inherit;
  width: 23.5rem;
  height: 8.2rem;
  background: var(--grey5);
  border-radius: var(--radius-md);
  cursor: pointer;
  box-shadow: var(--shadow-btn-default);
  margin: 0 auto;
}

.list-item-fullframe:hover {
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