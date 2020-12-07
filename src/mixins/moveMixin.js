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
    dropSetup (event) {
      event.stopPropagation()
      event.target.classList.remove('drag-over')
      return JSON.parse(event.dataTransfer.getData('text/plain'))
    },
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
    checkBishopMove (curPosition, position, diffX, diffY) {
      // check if move is diagonal
      if (Math.abs(diffX) !== Math.abs(diffY)) return false

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
    checkMove (piece, capturedPiece = null) {
      const curPosition = this.getPiece(piece).position
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
            !this.checkBishopMove(curPosition, position, diffX, diffY) &&
            !this.checkRookMove(curPosition, position, diffX)
          ) return false
          break

        case 'bishop':
          if (!this.checkBishopMove(curPosition, position, diffX, diffY)) return false
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
          var startPawnPosition = piece.color === 'white' ? 6 : 1
          var maxFirstMove = piece.color === 'white' ? 2 : -2
          var maxMove = piece.color === 'white' ? 1 : -1
          var squareAhead = piece.color === 'white' ? curPosition.y - 1 : curPosition.y + 1

          // capture
          if (capturedPiece && Math.abs(diffX) === diffY * maxMove) break

          if (diffX !== 0) return false

          if (
            (
              !(
                curPosition.y === startPawnPosition &&
                diffY <= maxFirstMove &&
                !this.isPieceOnPos({ x: curPosition.x, y: squareAhead })
              ) &&
              diffY !== maxMove
            ) ||
            this.isPieceOnPos({ ...position })
          ) return false
          break
      }

      this.move(piece)
      return true
    }
  }
}
