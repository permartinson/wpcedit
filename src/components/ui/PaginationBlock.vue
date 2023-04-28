<template>
    <div class="pagination">
        <StandardButton @click="this.$emit('prev')" size="small"><SmallIcon type="left"></SmallIcon> Previous page</StandardButton>
        <StandardButton @click="this.$emit('next')" size="small">Next page<SmallIcon type="right"></SmallIcon></StandardButton>
        <MinimalButton @click="this.$emit('start')" size="small">Go to first page</MinimalButton>
    </div>
</template>

<script>
import MinimalButton from './buttons/MinimalButton.vue'
import StandardButton from './buttons/StandardButton.vue'
import SmallIcon from '../icons/SmallIcon.vue'

export default {
  name: 'PaginationBlock',
  components: {
    MinimalButton,
        StandardButton,
        SmallIcon
    },
}
</script>

<style scoped>
  .pagination {
    display: flex;
    flex-direction: row;
    margin: var(--space-md) 0;
    padding-bottom: var(--space-md);
    align-items: center;
  }
  .pagination button {
    margin-right: var(--space-md);
  }
</style>