<template>
    <div class="save-section">
        <StandardButton v-if="romIsAltered" @click="this.$emit('save');" size="small" type="primary">Save ROM</StandardButton>
        <StandardButton v-if="romIsLoaded" @click="this.$emit('unload');" size="small" class="unload">Unload ROM</StandardButton>
        <div class="filename">
          <p class="label" v-if="romIsLoaded" :title="fileName">{{ fileName }}</p>
        </div>
    </div>
  </template>
  
  <script>
  import StandardButton from '../ui/buttons/StandardButton.vue';
  
  export default {
    name: 'SaveSection',
    components: {
        StandardButton
    },
    props: {
      fileName: String,
      romIsLoaded: Boolean,
      romIsAltered: Boolean
    }
  }
  
  </script>
  
  <style scoped>
  .save-section {
    display: flex;
    flex-flow: row;
    align-items: center;
  }
  .unload {
    margin-left: var(--space-sm);
  }
  .filename {
    position: relative;
    padding-left: var(--space-md);
    display: flex;
    align-items: center;
    width: 120px;
  }
  .label {
    font-size: var(--text-sm);
    font-weight: 300;
    color: var(--grey10);
    text-overflow: ellipsis;
    overflow:hidden;
    white-space:nowrap;
}
@media screen and (max-width: 860px) {
    .save-section {
        flex-flow: column;
        align-items: end;
    }
    .unload {
      margin-top: var(--space-xs);
    }
    .label {
      display: none;
    }
}

  </style>