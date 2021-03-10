<template>
  <img
    v-if="piece && position"
    :src="img"
    :alt="`${$parent.color} ${name}`"
    :style="position"
    :data-color="$parent.color"
    :data-name="name"
    :data-id="id"
    draggable="true"
    @mousedown="showPossibleMoves()"
    @dragstart="onDragStart"
    @dragenter.prevent
    @dragover.prevent
  />
</template>

<script>
import { mapMutations } from 'vuex'
import { moveMixin } from '@/mixins/moveMixin'

export default {
  name: 'piece',
  mixins: [moveMixin],
  data: () => ({
    img: null
  }),
  props: {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    piece () {
      return this.getPiece({ id: this.id, name: this.name, color: this.$parent.color })
    },
    position () {
      if (this.piece.position) {
        return {
          left: this.piece.position.x * (700 / 8) + 'px',
          top: this.piece.position.y * (700 / 8) + 'px'
        }
      } else {
        return null
      }
    }
  },
  methods: {
    ...mapMutations({
      setClickedPiece: 'SET_CLICKED_PIECE'
    }),
    showPossibleMoves () {
      if (this.activeColor === this.$parent.color) {
        const piece = this.getPiece({ id: this.id, name: this.name, color: this.$parent.color })
        this.setClickedPiece(piece)
      }
    },
    onDragStart (event) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', JSON.stringify(this.piece))
    }
  },
  created () {
    this.img = require(`../assets/${this.$parent.color}_${this.name}.png`)
  }
}
</script>

<style scoped>

</style>
