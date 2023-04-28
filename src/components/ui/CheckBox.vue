<template>
    <label class="label">{{ label }}
        <input class="input" type="checkbox" v-model="model" ref="checkbox">
        <span class="box"></span>
    </label>
</template>

<script>
export default {
  name: 'CheckBox',
  props: {
    label: String,
    checked: Boolean
  },
  data() {
    return {
    }
  },
  computed: {
    model: {
        get() { return this.checked },
        set(state) { this.$emit('change', state) }
    }
    }
}
</script>

<style scoped>
.input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    appearance: none;
}

.label {
    position: relative;
    font-size: var(--text-sm);
    font-weight: 300;
    color: var(--grey10);
    padding-left: 28px;
    display: flex;
    align-items: center;
}

.box {
    position: absolute;
    top: 0;
    left: 0;
    height: 18px;
    width: 18px;
    border: 1px solid var(--grey9);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.box:after {
    content: "";
    position: relative;
    width: 13px;
    height: 13px;
    background: var(--grey7);
    border-radius: 1.5px;
    opacity: 0;
}
.input:checked ~ .box:after {
    opacity: 1;
}
.label:hover .box:after {
    opacity: 0.4;
}
.label:hover .input:checked ~ .box:after {
    opacity: 0.8;
}
</style>