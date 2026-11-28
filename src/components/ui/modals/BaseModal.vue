<template>
  <Teleport to="body">
    <div v-if="show" class="modal-mask" role="presentation" @click="$emit('close')" @keydown="keydown">
      <div class="modal-container" ref="container" role="dialog" aria-modal="true" :aria-label="label" :aria-labelledby="labelledBy" tabindex="-1" @click.stop>
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { arrowKeysAreTaken, closeModal, keepTabInside, openModal } from '../../../helpers/modalFocus.js';

// The window for an image, and the disclaimer. Esc emits close, and the
// arrow keys emit step: -1 or 1, or -2 or 2 with Shift.
export default {
  name: 'BaseModal',
  props: {
    show: Boolean,
    // The name a screen reader reads for the window, usually its title
    label: String,
    // Or the id of the window's title. Use a fixed text: a value that changes
    // would make the window that uses BaseModal update, and the image
    // windows reset their position when they update.
    labelledBy: String
  },
  emits: ['close', 'step'],
  data() {
    return {
      returnFocusTo: null
    }
  },
  watch: {
    show: {
      immediate: true,
      handler(show) {
        if (show) {
          this.$nextTick(() => {
            this.returnFocusTo = openModal(this.$refs.container);
          });
        } else if (this.returnFocusTo !== null) {
          closeModal(this.returnFocusTo);
          this.returnFocusTo = null;
        }
      }
    }
  },
  beforeUnmount() {
    if (this.returnFocusTo !== null) {
      closeModal(this.returnFocusTo);
    }
  },
  methods: {
    keydown(event) {
      keepTabInside(event, this.$refs.container);
      if (event.key === 'Escape') {
        this.$emit('close');
      } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !arrowKeysAreTaken(event)) {
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        this.$emit('step', event.shiftKey ? direction * 2 : direction);
      }
    }
  },
  updated() {
    // prevent background scroll when the modal is open:
    if(this.show) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    }
  }
}
</script>

<style scoped>
.modal-mask {
  z-index: 1000;
  position: fixed;
  inset: 0;
  background: rgba(0.3,0.3,0.3,0.75);
  display: grid;
  place-items: center;
}

.modal-container {
  position: center;
  width: calc(100% - 3.2rem);
  max-width: 968px;
  background: var(--grey1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  padding-bottom: var(--space-md);
}

</style>