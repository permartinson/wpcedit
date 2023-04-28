<template>
    <button class="std-btn" :class="getClass()"><slot></slot></button>
</template>

<script>
export default {
  name: 'StandardButton',
  props: {
    size: String,
    type: String
  },
  methods: {
    getClass() {
        let className = "small";
        if(this.size == "large") {
            className = "large";
        }
        if (this.type == "primary") {
            className = className + " primary";
        }
        return className;
    }
  }
}
</script>

<style scoped>
.std-btn {
    font-family: inherit;
    transition: var(--hover-anim);
    background: var(--grey5);
    border: none;
    color: var(--grey8);
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: var(--shadow-btn-default);
}
.std-btn.large {
    height: 4.8rem;
    border-radius: var(--radius-md);
    font-size: var(--text-lg);
    font-weight: 700;
    padding: 0 var(--space-md);
}
.std-btn.small {
  height: 3.2rem;
  transition: var(--hover-anim);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 700;
  padding: 0 var(--space-sm);
}
.std-btn:hover {
    background: var(--grey4);
    box-shadow: var(--shadow-btn-hover);
}
.primary {
    color: var(--accent);
}

</style>