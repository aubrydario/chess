<template>
  <div class="info">
    <h2 :style="{ background: activeColor, color: otherColor }">{{ activeColorFormatted }} to move</h2>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'info',
  computed: {
    ...mapState([
      'activeColor'
    ]),
    activeColorFormatted () {
      return this.activeColor.charAt(0).toUpperCase() + this.activeColor.slice(1)
    },
    otherColor () {
      return this.activeColor === 'white' ? 'black' : 'white'
    }
  }
}
</script>

<style lang="scss" scoped>
  .info {
    width: 300px;
    margin-left: 50px;

    h2 {
      padding: 10px 20px;
      background: white;
      color: black;
      border: 2px solid black;
    }
  }
</style>
