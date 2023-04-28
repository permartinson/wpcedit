<template>
    <div class="header-container">
        <div class="area left-area">
            <div v-if="stepBtns" class="step-buttons">
                <MinimalButton @click="this.$emit('prev')" size="large"><LargeIcon type="left"></LargeIcon></MinimalButton>
                <MinimalButton @click="this.$emit('next')" size="large"><LargeIcon type="right"></LargeIcon></MinimalButton>
                <MinimalButton @click="this.$emit('prev2')" size="small" class="fast-btn"><SmallIcon type="double-left"></SmallIcon></MinimalButton>
                <MinimalButton @click="this.$emit('next2')" size="small" class="fast-btn"><SmallIcon type="double-right"></SmallIcon></MinimalButton>
            </div>
        </div>
        <div class="area middle-area"><p class="title">{{ title }}</p></div>
        <div class="area right-area">
            <div v-if="closeBtn" class="close-area">
                <MinimalButton @click="$emit('close')" size="large"><LargeIcon type="close"></LargeIcon></MinimalButton>
            </div>
        </div>
   </div>
</template>

<script>
import MinimalButton from '../buttons/MinimalButton.vue';
import LargeIcon from '../../icons/LargeIcon.vue';
import SmallIcon from '../../icons/SmallIcon.vue';

export default {
  name: 'ModalHeader',
  components: {
    MinimalButton,
    LargeIcon,
    SmallIcon
    },
  props: {
    title: String,
    closeBtn: Boolean,
    stepBtns: Boolean
  },
  methods: {
  }
}
</script>

<style scoped>

.header-container {
    height: 4.8rem;
    display: flex;
    flex-flow: row;
    justify-content:space-between;
    align-items: center;
    margin: 0 var(--space-sm);
}
.title {
    font-size: var(--text-xl);
    line-height: var(--text-leading-xl);
    font-weight: 700;
    color: var(--grey8);
}
.left-area, .right-area {
    width: 15rem;
    display: flex;
    align-items: center;
}
.left-area {
    justify-content: left;
}
.right-area {
    justify-content: right;
}
.step-buttons {
    display: flex;
    align-items: center;
}
.fast-btn {
    margin: var(--space-xs);
}
</style>