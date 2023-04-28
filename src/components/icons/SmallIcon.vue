<template>
    <span class="icon" :class="type"></span>
</template>

<script>
export default {
  name: 'SmallIcon',
  props: {
    type: String
  }
}
</script>

<style scoped>
.icon {
  display: inline-block;
  width: 1.6rem;
  height: 1.6rem;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--grey8);
}

.left {
  mask: var(--icon-chevron-left-sm);
}
.right {
  mask: var(--icon-chevron-right-sm);
}
.up {
  mask: var(--icon-chevron-up-sm);
}
.down {
  mask: var(--icon-chevron-down-sm);
}
.double-left {
  mask: var(--icon-double-left-sm);
}
.double-right {
  mask: var(--icon-double-right-sm);
}
</style>