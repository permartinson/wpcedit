<template>
    <span class="icon" :class="type"></span>
</template>

<script>
export default {
  name: 'LargeIcon',
  props: {
    type: String
  }
}
</script>

<style scoped>
.icon {
  display: inline-block;
  width: 2.4rem;
  height: 2.4rem;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--grey8);
}

.left {
  mask: var(--icon-chevron-left-lg);
}
.right {
  mask: var(--icon-chevron-right-lg);
}
.up {
  mask: var(--icon-chevron-up-lg);
}
.down {
  mask: var(--icon-chevron-down-lg);
}
.close {
  background: var(--icon-close-lg);
}
.check {
  mask: var(--icon-check-lg);
}
.info {
  mask: var(--icon-info-lg);
}
.warning {
  mask: var(--icon-warning-lg);
}
</style>