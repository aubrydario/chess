<template>
    <img
      @dragstart="onDragStart"
      v-if="piece"
      :src="img"
      :alt="`${$parent.color} ${name}`"
      :style="position"
      draggable="true"
    />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'piece',
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
      return {
        left: this.piece.position.x * (700 / 8) + 'px',
        top: this.piece.position.y * (700 / 8) + 'px'
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
    }
  },
  created () {
    this.img = require(`../assets/${this.$parent.color}_${this.name}.png`)
  }
}
</script>

<style scoped>

</style>
