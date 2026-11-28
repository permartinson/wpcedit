<template>
    <!-- Long lists only put the first images in the Tab order, so that Tab
         does not have to pass hundreds of images to get past the list. This
         button comes right after the last of them, and is only seen when it
         has keyboard focus. Mouse users see and click the whole list as before. -->
    <button v-if="shown < total" type="button" class="more-in-tab-order" @click="$emit('more')">
        Continue to {{ what }} {{ shown + 1 }}–{{ Math.min(shown + step, total) }} of {{ total }}
    </button>
</template>

<script>
// How many more images each press of the button puts in the Tab order
export const tabStep = 50;

export default {
  name: 'MoreInTabOrder',
  props: {
    // How many images are in the Tab order now
    shown: Number,
    // How many images there are in the list
    total: Number,
    // "images" or "sprites"
    what: String
  },
  emits: ['more'],
  data() {
    return {
      step: tabStep
    }
  }
}
</script>

<style scoped>
.more-in-tab-order {
    position: fixed;
    left: 50%;
    bottom: var(--space-lg);
    transform: translateX(-50%);
    z-index: 500;
    padding: var(--space-sm) var(--space-md);
    border: 0.2rem solid var(--accent);
    border-radius: var(--radius-sm);
    background: var(--grey1);
    color: var(--grey10);
    font: inherit;
    font-size: var(--text-sm);
    box-shadow: var(--shadow-modal);
    cursor: pointer;
}

/* Hidden until it has keyboard focus */
.more-in-tab-order:not(:focus) {
    clip-path: inset(50%);
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    white-space: nowrap;
}
</style>
