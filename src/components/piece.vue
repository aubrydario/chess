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
      @dragstart="onDragStart"
      @drop="onDrop"
      @dragenter.prevent
      @dragover.prevent
    />
</template>

<script>
import { mapGetters } from 'vuex'
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
    ...mapGetters([
      'getPiece'
    ]),
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
    onDragStart (event) {
      const data = {
        id: this.id,
        color: this.$parent.color,
        name: this.name
      }

      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', JSON.stringify(data))
    },
    onDrop (event) {
      const piece = this.dropSetup(event)
      const data = event.target.dataset
      const capturedPiece = this.getPiece({ id: parseInt(data.id), name: data.name, color: data.color })
      capturedPiece.color = data.color
      piece.position = capturedPiece.position

      if (piece.color !== capturedPiece.color) this.move(piece, capturedPiece)
    }
  },
  created () {
    this.img = require(`../assets/${this.$parent.color}_${this.name}.png`)
  }
}
</script>

<style scoped>

</style>
