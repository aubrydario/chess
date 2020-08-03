<template>
  <div>
    <piece :key="`king`" name="king" :id="1"></piece>
    <piece :key="`queen`" name="queen" :id="1"></piece>
    <piece v-for="id in 2" :key="`bishop-${id}`" name="bishop" :id="id"></piece>
    <piece v-for="id in 2" :key="`knight-${id}`" name="knight" :id="id"></piece>
    <piece v-for="id in 2" :key="`rook-${id}`" name="rook" :id="id"></piece>
    <piece v-for="id in 8" :key="`pawn-${id}`" name="pawn" :id="id"></piece>
  </div>
</template>

<script>
import Piece from '@/components/piece'

export default {
  name: 'Pieces',
  components: {
    Piece
  },
  props: {
    color: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
