<template>
  <div class="wrapper">
    <div class="inner-wrapper" ref="board">
      <div
        v-for="cell in 64"
        :key="cell"
        class="field"
        :data-x="(cell - 1) % 8"
        :data-y="Math.floor((cell - 1) / 8)"
        @drop="onDrop"
        @dragover="onDragEnter"
        @dragleave="onDragLeave"
        @dragenter.prevent
        @dragover.prevent
      ></div>
      <pieces v-for="color in ['white', 'black']" :key="color" :color="color"></pieces>
    </div>
  </div>
</template>

<script>
import { moveMixin } from '@/mixins/moveMixin'
import Pieces from '@/components/pieces'

export default {
  name: 'Board',
  components: {
    Pieces
  },
  mixins: [moveMixin],
  data: () => ({
    dragOverCell: null
  }),
  methods: {
    onDrop (event) {
      const piece = this.dropSetup(event)
      const newPos = { x: parseInt(event.target.dataset.x), y: parseInt(event.target.dataset.y) }

      this.move(piece, newPos)

      return false
    },
    onDragEnter (event) {
      event.target.classList.add('drag-over')
    },
    onDragLeave (event) {
      event.target.classList.remove('drag-over')
    }
  },
  mounted () {
    this.setAllLegalMovesForColor(this.activeColor)
  }
}
</script>

<style lang="scss">
$board-dimension: 700px;
$field-dimension: calc(#{$board-dimension} / 8);

.wrapper {
  width: $board-dimension;
  height: $board-dimension;
  background: #7D4E35;
  padding: 50px;

  .inner-wrapper {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: 100%;
    border: 5px solid black;

    .field {
      width: $field-dimension;
      height: $field-dimension;
      box-sizing: border-box;

      &:nth-child(16n+16),
      &:nth-child(16n+14),
      &:nth-child(16n+12),
      &:nth-child(16n+10),
      &:nth-child(16n+7),
      &:nth-child(16n+5),
      &:nth-child(16n+3),
      &:nth-child(16n+1) {
        background: #DCC69E;
      }
    }

    .drag-over {
      border: 5px solid lightgray !important;
    }

    img {
      width: $field-dimension;
      height: $field-dimension;
      position: absolute;
      cursor: grab;
    }
  }
}
</style>
