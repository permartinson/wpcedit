<template>
    <button class="dir-btn" :class="size"><slot></slot></button>
</template>

<script>
export default {
  name: 'MinimallButton',
  props: {
    size: String
  },
  methods: {
    getSize() {
        if(this.size == "large") {
            return "large";
        } else {
            return "small";
        }
    }
  }
}
</script>

<style scoped>
.dir-btn {
  font-family: inherit;
  background: none;
  border: none;
  color: var(--grey8);
  display: flex;
  align-items: center;
}
.dir-btn.large {
    height: 3.2rem;
    border-radius: var(--radius-sm);
    font-size: var(--text-lg);
    font-weight: 400;
    padding: 0 var(--space-xs);
    color: var(--grey8);
}
.dir-btn.small {
  height: 2.4rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 300;
  padding: 0 var(--space-xxs);
  color: var(--grey8);
}
.dir-btn:hover {
    background: var(--grey3);
}


</style>