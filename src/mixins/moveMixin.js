import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import _ from 'lodash'

export const moveMixin = {
  data: () => ({
    curPos: null,
    movedPos: null,
    diffX: 0,
    diffY: 0
  }),
  computed: {
    ...mapState([
      'activeColor',
      'pieces'
    ]),
    ...mapGetters([
      'getPiece',
      'isPieceOnPos',
      'getCheckState'
    ]),
    oppositeColor () {
      return this.activeColor === 'white' ? 'black' : 'white'
    }
  },
  methods: {
    ...mapMutations({
      setCheckState: 'SET_CHECK_STATE',
      changeActiveColor: 'CHANGE_ACTIVE_COLOR'
    }),
    ...mapActions([
      'setPiecePosition'
    ]),
    dropSetup (event) {
      event.stopPropagation()
      event.target.classList.remove('drag-over')
      return JSON.parse(event.dataTransfer.getData('text/plain'))
    },
    checkRookMove () {
      // check if move is horizontal or vertical
      if (this.curPos.x !== this.movedPos.x && this.curPos.y !== this.movedPos.y) return false

      // check if piece is in the way
      const range = _.range(this.curPos[this.diffX === 0 ? 'y' : 'x'], this.movedPos[this.diffX === 0 ? 'y' : 'x'])
      range.shift() // remove first item
      const blocked = range.some(item => {
        const checkPosition = this.diffX === 0 ? { x: this.curPos.x, y: item } : { x: item, y: this.curPos.y }
        return this.isPieceOnPos(checkPosition)
      })

      return !blocked
    },
    checkBishopMove () {
      // check if move is diagonal
      if (Math.abs(this.diffX) !== Math.abs(this.diffY)) return false

      // check if piece is in the way
      const rangeX = _.range(this.curPos.x, this.movedPos.x)
      const rangeY = _.range(this.curPos.y, this.movedPos.y)
      rangeX.shift() // remove first item
      rangeY.shift() // remove first item

      const blocked = rangeX.some((item, index) => {
        return this.isPieceOnPos({ x: item, y: rangeY[index] })
      })

      return !blocked
    },
    checkKnightMove () {
      return (
        (this.curPos.x + 2 === this.movedPos.x && this.curPos.y + 1 === this.movedPos.y) ||
        (this.curPos.x + 2 === this.movedPos.x && this.curPos.y - 1 === this.movedPos.y) ||
        (this.curPos.x - 2 === this.movedPos.x && this.curPos.y + 1 === this.movedPos.y) ||
        (this.curPos.x - 2 === this.movedPos.x && this.curPos.y - 1 === this.movedPos.y) ||
        (this.curPos.y + 2 === this.movedPos.y && this.curPos.x + 1 === this.movedPos.x) ||
        (this.curPos.y + 2 === this.movedPos.y && this.curPos.x - 1 === this.movedPos.x) ||
        (this.curPos.y - 2 === this.movedPos.y && this.curPos.x + 1 === this.movedPos.x) ||
        (this.curPos.y - 2 === this.movedPos.y && this.curPos.x - 1 === this.movedPos.x)
      )
    },
    checkPawnMove (color, capturedPiece) {
      const startPawnPosition = color === 'white' ? 6 : 1
      const maxFirstMove = color === 'white' ? 2 : -2
      const maxMove = color === 'white' ? 1 : -1
      const squareAhead = color === 'white' ? this.curPos.y - 1 : this.curPos.y + 1

      // capture
      if (Math.abs(this.diffX) * maxMove === maxMove && this.diffY === maxMove && this.isPieceOnPos(this.movedPos)) return true

      if (this.diffX !== 0) return false

      return !((
        !(
          this.curPos.y === startPawnPosition &&
          (this.diffY === maxFirstMove || this.diffY === maxMove) &&
          !this.isPieceOnPos({
            x: this.curPos.x,
            y: squareAhead
          })
        ) &&
        this.diffY !== maxMove
      ) ||
      this.isPieceOnPos({ ...this.movedPos }))
    },
    isLegalMove (piece, capturedPiece = null) {
      this.curPos = this.getPiece(piece).position
      this.movedPos = piece.position
      this.diffX = this.curPos.x - this.movedPos.x
      this.diffY = this.curPos.y - this.movedPos.y

      // check if piece move is correct
      switch (piece.name) {
        case 'king':
          if (
            (this.diffX > 1 || this.diffX < -1) ||
            (this.diffY > 1 || this.diffY < -1)
          ) return false
          break

        case 'queen':
          if (
            !this.checkBishopMove() &&
            !this.checkRookMove()
          ) return false
          break

        case 'bishop':
          if (!this.checkBishopMove()) return false
          break

        case 'rook':
          if (!this.checkRookMove()) return false
          break

        case 'knight':
          if (!this.checkKnightMove()) return false
          break

        case 'pawn':
          if (!this.checkPawnMove(piece.color, capturedPiece)) return false
          break
      }
      return true
    },
    isCheck (color = this.activeColor) {
      const oppositeColor = color === 'white' ? 'black' : 'white'
      const kingPosition = this.getPiece({ id: 1, name: 'king', color: color }).position

      return this.pieces[oppositeColor].some(piece => {
        if (piece.position) {
          const pieceClone = _.clone(piece)
          pieceClone.position = kingPosition
          pieceClone.color = oppositeColor

          return this.isLegalMove(pieceClone)
        }
        return false
      })
    },
    move (piece, capturedPiece = null) {
      // check if correct colors turn
      if (piece.color !== this.activeColor) return false

      if (this.isLegalMove(piece, capturedPiece)) {
        console.log('legal move')
        const piecesBeforeMove = _.cloneDeep(this.pieces)
        const pieceBeforeMove = piecesBeforeMove[this.activeColor].find(p => p.name === piece.name && p.id === piece.id)
        const capturedPieceBeforeMove = _.clone(capturedPiece)

        this.setPiecePosition(piece)
        if (capturedPiece) this.setPiecePosition({ ...capturedPiece, position: null })

        // is reacted on check (not in check after move)
        if (this.isCheck()) {
          this.setPiecePosition(pieceBeforeMove)
          if (capturedPiece) this.setPiecePosition(capturedPieceBeforeMove)
          return false
        }

        this.setCheckState({ color: this.oppositeColor, checkState: this.isCheck(this.oppositeColor) })

        this.changeActiveColor()

        return true
      } else {
        console.log('illegal move')

        return false
      }
    }
  }
}
