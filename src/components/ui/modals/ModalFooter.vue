<template>
    <div class="footer">
        <slot></slot>
    </div>
</template>


<script>
  export default {
    name: 'ExportSection',
  }
</script>

<style scoped>
    .footer {
        border-top: 1px solid var(--grey3);
        margin: 0 var(--space-md);
        padding: var(--space-md) 0 0 0;
    }
</style>