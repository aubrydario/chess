<template>
  <div id="app">
    <Board/>
    <Info/>
  </div>
</template>

<script>
import Board from './components/board'
import Info from './components/info'

export default {
  name: 'App',
  components: {
    Board,
    Info
  }
}
</script>

<style lang="scss" scoped>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
    display: flex;
    justify-content: center;
  }
</style>
