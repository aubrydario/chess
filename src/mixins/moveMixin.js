import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import _ from 'lodash'

export const moveMixin = {
  data: () => ({
    diagonal: [{ x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }],
    straight: [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]
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
      'setPiecePosition',
      'setPieceMoves'
    ]),
    dropSetup (event) {
      event.stopPropagation()
      event.target.classList.remove('drag-over')
      return JSON.parse(event.dataTransfer.getData('text/plain'))
    },
    getMovesFromDirections (directions, position) {
      const startPosition = _.clone(position)
      const legalMoves = []

      directions.forEach(direction => {
        position = _.clone(startPosition)
        position.x += direction.x
        position.y += direction.y

        while (position.x < 8 && position.y < 8 && position.x >= 0 && position.y >= 0) {
          if (this.isPieceOnPos({ position, colors: [this.activeColor] })) break
          legalMoves.push(_.clone(position))
          if (this.isPieceOnPos({ position, colors: [this.oppositeColor] })) break

          position.x += direction.x
          position.y += direction.y
        }
      })

      return legalMoves
    },
    getMovesFromSquares (squares, position) {
      const startPosition = _.clone(position)
      const legalMoves = []

      squares.forEach(square => {
        position = _.clone(startPosition)
        position = { x: position.x + square.x, y: position.y + square.y }
        if (
          position.x < 8 && position.y < 8 && position.x >= 0 && position.y >= 0 &&
          !this.isPieceOnPos({ position, colors: [this.activeColor] })
        ) legalMoves.push(position)
      })

      return legalMoves
    },
    getPawnMoves (piece) {
      let position = null
      const legalMoves = []
      const startPawnPosition = piece.color === 'white' ? 6 : 1
      const maxFirstMove = piece.color === 'white' ? -2 : 2
      const maxMove = piece.color === 'white' ? -1 : 1

      // is no piece on the square ahead
      position = { x: piece.position.x, y: piece.position.y + maxMove }
      if (!this.isPieceOnPos({ position })) {
        legalMoves.push(position)

        // is pawn on the starting square and is no piece on the square ahead
        position = { x: piece.position.x, y: piece.position.y + maxFirstMove }
        if (
          this.piece.position.y === startPawnPosition &&
          !this.isPieceOnPos({ position })
        ) legalMoves.push(position)
      }

      // is opposite piece directly diagonal
      [1, -1].forEach(x => {
        position = { x: piece.position.x + x, y: piece.position.y + maxMove }
        if (this.isPieceOnPos({ position, colors: [this.oppositeColor] })) legalMoves.push(position)
      })

      return legalMoves
    },
    getBishopMoves (piece) {
      return this.getMovesFromDirections(this.diagonal, piece.position)
    },
    getRookMoves (piece) {
      return this.getMovesFromDirections(this.straight, piece.position)
    },
    setLegalMoves (piece) {
      let legalMoves = null
      console.log(piece)

      switch (piece.name) {
        case 'pawn':
          legalMoves = this.getPawnMoves(piece)
          break

        case 'knight':
          var knightPositions = [
            { x: 2, y: 1 }, { x: 2, y: -1 }, { x: -2, y: 1 }, { x: -2, y: -1 },
            { x: 1, y: 2 }, { x: 1, y: -2 }, { x: -1, y: 2 }, { x: -1, y: -2 }
          ]
          legalMoves = this.getMovesFromSquares(knightPositions, piece.position)
          break

        case 'bishop':
          legalMoves = this.getBishopMoves(piece)
          break

        case 'rook':
          legalMoves = this.getRookMoves(piece)
          break

        case 'queen':
          legalMoves = [...this.getBishopMoves(piece), ...this.getRookMoves(piece)]
          break

        case 'king':
          legalMoves = this.getMovesFromSquares([...this.diagonal, ...this.straight], piece.position)
          break
      }

      console.log(legalMoves)
      if (legalMoves.length) this.setPieceMoves({ ...piece, moves: legalMoves })
    },
    move (piece, newPos, capturedPiece = null) {
      if (piece.moves && piece.color === this.activeColor) {
        const move = piece.moves.find(move => _.isEqual(move, newPos))

        if (move) {
          this.setPiecePosition({ ...piece, position: newPos })
          if (capturedPiece) this.setPiecePosition({ ...capturedPiece, position: null })

          this.changeActiveColor()
        }
      }

      return false
    }
  }
}
