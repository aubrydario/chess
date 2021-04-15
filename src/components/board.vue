<template>
  <div class="wrapper">
    <div class="inner-wrapper" ref="board">
      <div
        v-for="cell in 64"
        :key="cell"
        class="field"
        :data-x="(cell - 1) % 8"
        :data-y="Math.floor((cell - 1) / 8)"
      ></div>
      <pieces v-for="color in ['white', 'black']" :key="color" :color="color"></pieces>
      <div v-if="clickedPiece">
        <div v-for="(move, index) in clickedPiece.moves"
          :key="index"
          class="possible-move"
          :style="getPosition(move)"
          :data-x="move.x"
          :data-y="move.y"
          @drop="onDrop"
          @dragover="onDragEnter"
          @dragleave="onDragLeave"
          @dragenter.prevent
          @dragover.prevent
        >
          <span
            :data-x="move.x"
            :data-y="move.y"
            @drop="onDrop"
            @dragover="onDragEnter"
            @dragleave="onDragLeave"
            @dragenter.prevent
            @dragover.prevent
            class="possible-move__circle"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
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
  computed: {
    ...mapState([
      'clickedPiece'
    ])
  },
  methods: {
    ...mapMutations({
      setClickedPiece: 'SET_CLICKED_PIECE'
    }),
    onDrop (event) {
      const piece = this.dropSetup(event)
      const data = event.target.dataset
      const newPos = { x: parseInt(data.x), y: parseInt(data.y) }
      const oppositeColor = this.activeColor === 'white' ? 'black' : 'white'

      this.capturedPiece = this.getPieceOnPos({ position: newPos, colors: [oppositeColor] })
      this.setClickedPiece(null)

      this.move(piece, newPos)

      return false
    },
    onDragEnter (event) {
      let field = event.target
      if (field.className === 'possible-move__circle') {
        field = field.parentNode
      }
      field.classList.add('drag-over')
    },
    onDragLeave (event) {
      let field = event.target
      if (field.className === 'possible-move__circle') {
        field = field.parentNode
      }
      field.classList.remove('drag-over')
    },
    getPosition (move) {
      return {
        left: move.x * (700 / 8) + 'px',
        top: move.y * (700 / 8) + 'px'
      }
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

    .possible-move {
      position: absolute;
      width: $field-dimension;
      height: $field-dimension;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;

      .possible-move__circle {
        display: block;
        width: 50px;
        height: 50px;
        background-color: rgba(150, 150, 150, 0.5);
        border-radius: 50%;
      }
    }
  }
}
</style>
