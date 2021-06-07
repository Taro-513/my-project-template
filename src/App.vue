<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App',
    created() {
      // 在页面加载时读取localStorage里的状态信息
      if (sessionStorage.getItem('stateInfo')) {
        this.$store.replaceState(JSON.parse(sessionStorage.getItem('stateInfo')))
        this.$nextTick(() => {
          // sessionStorage.removeItem('stateInfo')
        })
      }
      // 在页面刷新时将vuex里的信息保存到localStorage里
      window.addEventListener('beforeunload', () => {
        this.$store.commit('clearLoading', 0)
        sessionStorage.setItem('stateInfo', JSON.stringify(this.$store.state))
      })
    },
    beforeUnmount() {
      this.$sotre.commit('clearLoading')
    }
  }
</script>
<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }
</style>
