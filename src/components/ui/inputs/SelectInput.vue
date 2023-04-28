<template>
    <div class="select">
    <select :name="name" @change="changeSelection" ref="select">
        <option v-for="(option,n) in options" :key="n" :value="option.value" :selected="option.selected">{{option.label}}</option>
    </select>
    <span class="focus"></span>
    </div>

</template>

<script>
export default {
  name: 'SelectInput',
  props: {
    name: String,
    options: Array
  },
  methods: {
    changeSelection() {
        const select = this.$refs.select;
        this.$emit('change',{value:select.value});
    }
  }
}


</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

select {
  appearance: none;
  background-color: transparent;
  border: none;
  margin: 0;
  width: 100%;
  height: 100%;
  font-family: inherit;
  font-size: inherit;
  cursor: inherit;
  line-height: inherit;
  color: var(--grey9);
  padding: 0 var(--space-lg) 0 var(--space-sm);
}
select::-ms-expand {
  display: none;
}
.select {
    height: 3.2rem;
    margin-top: var(--space-sm);
    width: 100%;
    border: 1px solid var(--grey7);
    background-color:var(--grey1);
    color: var(--grey7);
    font-size: 1.25rem;
    cursor: pointer;
    line-height: 1.1;
    position: relative;
}
.select:after {
    content: ' ';
    width: 3.2rem;
    position: absolute;
    right: 1px;
    top: 1px;
    bottom: 1px;
    background-color:var(--grey1);
    background-image: var(--icon-chevron-down-sm);
    background-position: right var(--space-sm) center;
    background-repeat: no-repeat;
    pointer-events: none;
}
select:focus {
    outline: none;
}
.select:hover {
    background-color:var(--grey2);
}
.select:hover::after {
    background-color:var(--grey2);
}
select + .focus {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border: 1px solid var(--accent);
    pointer-events: none;
}
select:focus + .focus {
    opacity: 1;
}
</style>