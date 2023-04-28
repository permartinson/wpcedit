<template>
    <div class="export-section">
        <div class="option-section">
            <label for="exportselect" class="label-sm">Export as:</label>
            <SelectInput name="exportselect" :options="options" class="export-select" @change="changeSetting"></SelectInput>
        </div>
        <StandardButton @click="this.$emit('export-main');" size="small" class="btn">Export main plane</StandardButton>
        <StandardButton @click="this.$emit('export-blend');" size="small" class="btn">Export blend plane</StandardButton>
    </div>
</template>
  
<script>
import StandardButton from '../ui/buttons/StandardButton.vue';
import SelectInput from '../ui/inputs/SelectInput.vue';
import { storeToRefs } from 'pinia';
import store from "../../stores/store.js";
import { useMainStore } from '../../stores/mainStore.js';

const MainStore = useMainStore(store);

  export default {
    name: 'ExportSection',
    components: {
        StandardButton,
        SelectInput
    },
    props: {
        options: Object
    },
    setup() {
        const { exportOption } = storeToRefs(MainStore);
        return {
            exportOption
        };
    },
    methods: {
        changeSetting(event) {
            if(event.value != undefined) {
                MainStore.setExportOption(Number(event.value));
            }
        }
    }
  }
  
  </script>
  
  <style scoped>
  .export-section {
    display: flex;
    flex-flow: row;
    align-items: flex-end;
  }
  .option-section {
    display: flex;
    flex-flow: column;
    margin-right: var(--space-md);
  }
.btn {
    margin-right: var(--space-md);
}

  </style>