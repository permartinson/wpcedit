<template>
    <div v-if="show" class="alert-mask">
      <div class="alert-container" @click.stop>
        <div class="header-container">
          <p class="title">{{ title }}</p>
        </div>
          <slot></slot>
      </div>
    </div>
</template>

<script>
export default {
  name: 'AlertDialog',
  props: {
    show: Boolean,
    title: String
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
.alert-mask {
  z-index: 1000;
  position: fixed;
  inset: 0;
  background: rgba(0.3,0.3,0.3,0.75);
  display: grid;
  place-items: center;
}
.alert-container {
  position: center;
  width: calc(100% - 3.2rem);
  max-width: 42rem;
  padding: 0 var(--space-lg);
  background: var(--grey1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  padding-bottom: var(--space-md);
}
.header-container {
  height: 4.8rem;
  display: flex;
  flex-flow: row;
  justify-content:center;
  align-items: center;
  margin: 0 var(--space-sm);
  margin-bottom: var(--space-sm);
}
.title {
  font-size: var(--text-xl);
  line-height: var(--text-leading-xl);
  font-weight: 700;
  color: var(--accent);
}
</style>