<template>
    <div v-if="show" class="modal-mask" @click="$emit('close')">
      <div class="modal-container" @click.stop>
        <slot></slot>
      </div>
    </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    show: Boolean
  },
  methods: {
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