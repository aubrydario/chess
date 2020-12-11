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
      'getPieceOnPos',
      'getCheckState'
    ])
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
    oppositeColor (color) {
      return color === 'white' ? 'black' : 'white'
    },
    dropSetup (event) {
      event.stopPropagation()
      event.target.classList.remove('drag-over')
      return JSON.parse(event.dataTransfer.getData('text/plain'))
    },
    setCheckWhenKingOnPos (position, piece) {
      if (piece && piece.name === 'king') {
        this.setCheckState({ color: piece.color, checkState: true })
      }
    },
    isStillCheck (color) {
      let checkState = true

      this.setCheckState({ color, checkState: false })

      this.pieces[this.oppositeColor(color)].forEach(piece => {
        if (piece.position) this.getLegalMoves(piece, true)
      })

      checkState = this.getCheckState(color)
      this.setCheckState({ color, checkState: true })

      return checkState
    },
    getMovesFromDirections (directions, piece) {
      const startPosition = _.clone(piece.position)
      const legalMoves = []
      let position = null

      directions.forEach(direction => {
        position = _.clone(startPosition)
        position.x += direction.x
        position.y += direction.y

        while (position.x < 8 && position.y < 8 && position.x >= 0 && position.y >= 0) {
          if (this.getPieceOnPos({ position, colors: [piece.color] })) break
          legalMoves.push(_.clone(position))
          // if (this.getCheckState()) {
          //   console.log(this.isStillCheck(piece.color))
          //
          //   if (!this.isStillCheck(piece.color)) {
          //     legalMoves.push(_.clone(position))
          //   }
          // } else {
          //   legalMoves.push(_.clone(position))
          // }

          const oppositePieceOnPos = this.getPieceOnPos({ position, colors: [this.oppositeColor(piece.color)] })
          if (oppositePieceOnPos) {
            this.setCheckWhenKingOnPos(position, oppositePieceOnPos)
            break
          }

          position.x += direction.x
          position.y += direction.y
        }
      })

      return legalMoves
    },
    getMovesFromSquares (squares, piece) {
      const startPosition = _.clone(piece.position)
      const legalMoves = []
      let position = null

      squares.forEach(square => {
        position = _.clone(startPosition)
        position = { x: position.x + square.x, y: position.y + square.y }
        if (
          position.x < 8 && position.y < 8 && position.x >= 0 && position.y >= 0 &&
          !this.getPieceOnPos({ position, colors: [piece.color] })
        ) {
          legalMoves.push(position)

          const oppositePieceOnPos = this.getPieceOnPos({ position, colors: [this.oppositeColor(piece.color)] })
          this.setCheckWhenKingOnPos(position, oppositePieceOnPos)
        }
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
      if (!this.getPieceOnPos({ position })) {
        legalMoves.push(position)

        // is pawn on the starting square and is no piece on the square ahead
        position = { x: piece.position.x, y: piece.position.y + maxFirstMove }
        if (
          piece.position.y === startPawnPosition &&
          !this.getPieceOnPos({ position })
        ) legalMoves.push(position)
      }

      // is opposite piece directly diagonal
      [1, -1].forEach(x => {
        position = { x: piece.position.x + x, y: piece.position.y + maxMove }
        const oppositePieceOnPos = this.getPieceOnPos({ position, colors: [this.oppositeColor(piece.color)] })
        if (oppositePieceOnPos) {
          legalMoves.push(position)

          this.setCheckWhenKingOnPos(position, oppositePieceOnPos)
        }
      })

      return legalMoves
    },
    getBishopMoves (piece) {
      return this.getMovesFromDirections(this.diagonal, piece)
    },
    getRookMoves (piece) {
      return this.getMovesFromDirections(this.straight, piece)
    },
    setAllLegalMoves () {
      ['white', 'black'].forEach(color => this.pieces[color].forEach(piece => {
        if (piece.position) {
          const moves = this.getLegalMoves(piece)
          if (moves) this.setPieceMoves({ ...piece, moves })
        }
      }))
    },
    getLegalMoves (piece, testCheck = false) {
      let legalMoves = null
      console.log(JSON.stringify(piece))

      switch (piece.name) {
        case 'pawn':
          legalMoves = this.getPawnMoves(piece)
          break

        case 'knight':
          var knightPositions = [
            { x: 2, y: 1 }, { x: 2, y: -1 }, { x: -2, y: 1 }, { x: -2, y: -1 },
            { x: 1, y: 2 }, { x: 1, y: -2 }, { x: -1, y: 2 }, { x: -1, y: -2 }
          ]
          legalMoves = this.getMovesFromSquares(knightPositions, piece)
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
          legalMoves = this.getMovesFromSquares([...this.diagonal, ...this.straight], piece)
          break
      }

      console.log(legalMoves)
      return legalMoves
    },
    move (piece, newPos, capturedPiece = null) {
      if (piece.moves && piece.color === this.activeColor) {
        const move = piece.moves.find(move => _.isEqual(move, newPos))

        if (move) {
          this.setCheckState({ color: piece.color, checkState: false })
          this.setPiecePosition({ ...piece, position: newPos })
          if (capturedPiece) this.setPiecePosition({ ...capturedPiece, position: null })

          this.changeActiveColor()
          this.setAllLegalMoves()
        }
      }

      return false
    }
  }
}
