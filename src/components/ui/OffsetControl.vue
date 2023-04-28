<template>
    <div class="control-container">
        <div class="buttons">
            <div class="up-container">
                <MinimalButton @click="this.$emit('move-y',-1);" size="large" class="up"><LargeIcon type="up"></LargeIcon></MinimalButton>
            </div>
            <div class="down-container">
                <MinimalButton @click="this.$emit('move-y',1);" size="large" class="down"><LargeIcon type="down"></LargeIcon></MinimalButton>
            </div>
            <div class="left-container">
                <MinimalButton @click="this.$emit('move-x',-1);" size="large" class="left"><LargeIcon type="left"></LargeIcon></MinimalButton>
            </div>
            <div class="right-container">
                <MinimalButton @click="this.$emit('move-x',1);" size="large" class="right"><LargeIcon type="right"></LargeIcon></MinimalButton>
            </div>
            <div class="position-container">
                <p class="label-header">Position:</p>
                <div class="label-container">
                    <p class="label">X: {{ xOffset }}</p>
                    <p class="label">Y: {{ yOffset }}</p>
                </div>
            </div>
        </div>
    </div>
  </template>
  
  <script>
  import MinimalButton from './buttons/MinimalButton.vue';
  import LargeIcon from '../icons/SmallIcon.vue';
  
  export default {
    name: 'OffsetCotrol',
    components: {
      MinimalButton,
      LargeIcon

    },
    props: {
      xOffset: Number,
      yOffset: Number
    },
    methods: {
    }
  }
  
  </script>
  
  <style scoped>
  .control-container {
    width: 100%;
  }
  .buttons {
    position: relative;
    width: 14.6rem;
    height: 16rem;
    margin: 0 auto;
    justify-items: center;
  }
  .up-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    display: flex;
    justify-content: center;
}
  .down-container {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
  }
  .left-container {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
  }
  .right-container {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
  }

  .position-container {
    position: absolute;
    display: flex;
    width: 8rem;
    height: 6rem;
    top: 5rem;
    left: 3.6rem;
    justify-content: flex-start;
    flex-direction: column;
  }
  .label-container {
    display: flex;
    height: 1.2rem;
    flex-direction: row;
    justify-content: space-between;
  }
  .label-header {
    position: relative;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--grey7);
    text-align: center;
    margin: .4rem;
    margin-right: 1rem;
    height: 1.2rem;
  }
  .label {
    position: relative;
    font-size: var(--text-sm);
    font-weight: 300;
    color: var(--grey10);
    display: flex;
    align-items: center;
    width: 3.6rem;
}
  </style>