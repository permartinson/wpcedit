<template>
    <router-link class="feature-btn" :to="to">
        <span class="feature-btn-outer">
            <span class="feature-btn-inner" :class="icon"></span>
        </span>
        <span class="label"><slot></slot></span>
    </router-link>
</template>

<script>

export default {
  name: 'FeatureButton',
  props: {
    icon: String,
    to: String
  }
}

</script>

<style scoped>
.feature-btn {
    display: block;
    color: inherit;
    text-decoration: none;
    width: 14.4rem;
    text-align: center;
    cursor: pointer;
    margin: var(--space-md) var(--space-sm);
}

.feature-btn-outer {
    display: block;
    position: relative;
    width: 14.4rem;
    height: 14.4em;
    background: var(--grey5);
    border-radius: 50%;
    box-shadow: var(--shadow-btn-default);
}

.feature-btn:hover .feature-btn-outer {
    background: var(--grey4);
    box-shadow: var(--shadow-btn-hover);
}

.feature-btn-inner {
    display: block;
    position: absolute;
    top: var(--btn-outer-frame);
    left: var(--btn-outer-frame);
    bottom: var(--btn-outer-frame);
    right: var(--btn-outer-frame);
    border: 0.1rem solid var(--grey8);
    border-radius: 50%;
    background-position: center;
}
.label {
    display: block;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--grey8);
    margin-top: var(--space-md);
}
.hex {
    background-image: var(--icon-hex-editor);
}
.checksum {
    background-image: var(--icon-checksum);
}
.fullframe {
    background-image: var(--icon-fullframe);
}
.sprites {
    background-image: var(--icon-sprites);
}
.settings {
    background-image: var(--icon-settings);
}
</style>