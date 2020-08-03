import { mapActions, mapGetters } from 'vuex'
import _ from 'lodash'

export const moveMixin = {
  computed: {
    ...mapGetters([
      'getPiece',
      'isPieceOnPos'
    ])
  },
  methods: {
    ...mapActions([
      'move'
    ]),
    checkRookMove (curPosition, position, diffX) {
      // check if move is horizontal or vertical
      if (curPosition.x !== position.x && curPosition.y !== position.y) return false

      // check if piece is in the way
      const range = _.range(curPosition[diffX === 0 ? 'y' : 'x'], position[diffX === 0 ? 'y' : 'x'])
      range.shift() // remove first item
      const blocked = range.some(item => {
        const checkPosition = diffX === 0 ? { x: curPosition.x, y: item } : { x: item, y: curPosition.y }
        return this.isPieceOnPos(checkPosition)
      })

      return !blocked
    },
    checkBishopMove (curPosition, position) {
      // check if move is diagonal
      if (Math.abs(curPosition.x - position.x) !== Math.abs(curPosition.y - position.y)) return false

      // check if piece is in the way
      const rangeX = _.range(curPosition.x, position.x)
      const rangeY = _.range(curPosition.y, position.y)
      rangeX.shift() // remove first item
      rangeY.shift() // remove first item

      const blocked = rangeX.some((item, index) => {
        return this.isPieceOnPos({ x: item, y: rangeY[index] })
      })

      return !blocked
    },
    checkMove (piece) {
      const curPosition = this.getPiece({ ...piece }).position
      const position = piece.position
      const diffX = curPosition.x - position.x
      const diffY = curPosition.y - position.y

      switch (piece.name) {
        case 'king':
          if (
            (diffX > 1 || diffX < -1) ||
            (diffY > 1 || diffY < -1)
          ) return false
          break

        case 'queen':
          if (
            !this.checkBishopMove(curPosition, position) &&
            !this.checkRookMove(curPosition, position, diffX)
          ) return false
          break

        case 'bishop':
          if (!this.checkBishopMove(curPosition, position)) return false
          break

        case 'rook':
          if (!this.checkRookMove(curPosition, position, diffX)) return false
          break

        case 'knight':
          if (
            !(
              (curPosition.x + 2 === position.x && curPosition.y + 1 === position.y) ||
              (curPosition.x + 2 === position.x && curPosition.y - 1 === position.y) ||
              (curPosition.x - 2 === position.x && curPosition.y + 1 === position.y) ||
              (curPosition.x - 2 === position.x && curPosition.y - 1 === position.y) ||
              (curPosition.y + 2 === position.y && curPosition.x + 1 === position.x) ||
              (curPosition.y + 2 === position.y && curPosition.x - 1 === position.x) ||
              (curPosition.y - 2 === position.y && curPosition.x + 1 === position.x) ||
              (curPosition.y - 2 === position.y && curPosition.x - 1 === position.x)
            )
          ) return false
          break

        case 'pawn':
          if (piece.color === 'white') {
            if (
              !(
                curPosition.y === 6 &&
                curPosition.y - position.y <= 2 &&
                !this.isPieceOnPos({ x: curPosition.x, y: curPosition.y - 1 })
              ) &&
              curPosition.y - position.y !== 1
            ) return false
          } else {
            if (
              !(
                curPosition.y === 1 &&
                position.y - curPosition.y <= 2 &&
                !this.isPieceOnPos({ x: curPosition.x, y: curPosition.y + 1 })
              ) &&
              position.y - curPosition.y !== 1
            ) return false
          }
          break
      }

      this.move(piece)
      return true
    }
  }
}
