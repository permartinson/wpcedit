<template>
    <input type="number" class="num-input" :class="getClass()" :min="min" :max="max" v-model="model" ref="input" />
</template>

<script>
export default {
  name: 'NumeralInput',
  props: {
    value: Number,
    max: Number,
    min: Number,
    maxlength: Number,
    size: String
  },
  computed: {
    model: {
        get() { return this.value },
        set(value) {
        // limit the length of the input value, by converting back and forth to a string:
        const input = this.$refs.input;
        const length = value.toString().length;
        if(length>this.maxlength) {
            input.value = Number( value.toString().slice(0,this.maxlength)); 
        }
        this.$emit('input', value);
      }
    }
  },
  methods: {
    getClass() {
        let className = "small";
        if(this.size == "large") {
            className = "large";
        }
        return className;
    },
    limitLength() {
        const input = this.$refs.input;
        const value = input.value
        if(value.length>=this.maxlength) {
            input.value = value.slice(0,this.maxlength-1)
        }
    }
  }
}
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

.num-input {
    font-family: inherit;
    transition: var(--hover-anim);
    background: var(--grey5);
    box-sizing: border-box;
    border: 1px solid var(--grey8);
    border-radius: var(--radius-xs);
    font-weight: 400;
    color: var(--grey9);
    text-align: center;
}
.num-input.large {
    height: 4.8rem;
    font-size: var(--text-md);
    padding: 0 var(--space-md);
}
.num-input.small {
  height: 3.2rem;
  font-size: var(--text-sm);
  font-weight: 700;
  padding: 0 var(--space-sm);
}
.num-input:hover {
    background: var(--grey4);
}

</style>