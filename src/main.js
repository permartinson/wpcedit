import { createApp } from 'vue';
import {createRouter, createWebHistory} from "vue-router";
import store from "./stores/store.js";
import VueObserveVisibility from 'vue-observe-visibility'

import App from './App.vue';
import HomeView from './views/HomeView.vue';
import FullFrameView from './views/FullFrameView.vue';
import SpritesView from './views/SpritesView.vue';
import ChecksumView from './views/ChecksumView.vue';
import SettingsView from './views/SettingsView.vue';
import './registerServiceWorker'

const routes = [
    {
        path: '/',
        component: HomeView,
    },
    {
        path: '/fullframe',
        component: FullFrameView
    },
    {
        path: '/sprites',
        component: SpritesView
    },
    {
        path: '/checksum',
        component: ChecksumView
    },
    {
        path: '/settings',
        component: SettingsView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})


router.afterEach((to) => {
    document.title = "WPC Edit";
    to.meta.transition = 'fade';
})

createApp(App).use(VueObserveVisibility).use(store).use(router).mount('#app');