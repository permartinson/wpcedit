const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  pwa: {
    name: 'WPC Edit',
    themeColor: '#2D2D2D',
    msTileColor: '#2D2D2D',
    appleMobileWebAppCapable: 'no'
  },
  transpileDependencies: true
})
