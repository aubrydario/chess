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
      'pieces',
      'simulationCheckState'
    ]),
    ...mapGetters([
      'getPiece',
      'getPieceOnPos',
      'getCheckState',
      'getSimulationCheckState',
      'getAllLegalMovesForColor'
    ])
  },
  methods: {
    ...mapMutations({
      setCheckState: 'SET_CHECK_STATE',
      changeActiveColor: 'CHANGE_ACTIVE_COLOR',
      setSimulationCheckState: 'SET_SIMULATION_CHECK_STATE'
    }),
    ...mapActions([
      'setPiecePosition',
      'setSimulationPiecePosition',
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
    addLegalMove (moves, newMove, piece, simulation) {
      if (simulation || !this.getCheckState() || this.blocksCheck(piece, newMove)) {
        moves.push(_.clone(newMove))
      }

      return moves
    },
    simulateIfStillCheck (color) {
      const pieces = this.pieces[color].filter(piece =>
        piece.name === 'rook' ||
        piece.name === 'queen' ||
        piece.name === 'bishop'
      )

      pieces.forEach(piece => {
        if (piece.position) this.getLegalMoves(piece, true)
      })
    },
    blocksCheck (piece, newPos) {
      this.setSimulationCheckState(false)
      this.setSimulationPiecePosition({ ...piece, position: newPos })

      // set check state
      this.simulateIfStillCheck(this.oppositeColor(piece.color))

      return !this.getSimulationCheckState()
    },
    setCheckWhenKingOnPos (position, piece, simulation) {
      if (piece && piece.name === 'king') {
        if (simulation) {
          this.setSimulationCheckState(true)
          return
        }
        this.setCheckState({ color: piece.color, checkState: true })
      }
    },
    getMovesFromDirections (directions, piece, simulation) {
      const startPosition = _.clone(piece.position)
      let legalMoves = []
      let position = null

      directions.forEach(direction => {
        position = _.clone(startPosition)
        position.x += direction.x
        position.y += direction.y

        while (position.x < 8 && position.y < 8 && position.x >= 0 && position.y >= 0) {
          if (this.getPieceOnPos({ position, colors: [piece.color], simulation })) break

          legalMoves = this.addLegalMove(legalMoves, position, piece, simulation)

          const oppositePieceOnPos = this.getPieceOnPos({ position, colors: [this.oppositeColor(piece.color)], simulation })
          if (oppositePieceOnPos) {
            this.setCheckWhenKingOnPos(position, oppositePieceOnPos, simulation)
            break
          }

          position.x += direction.x
          position.y += direction.y
        }
      })

      return legalMoves
    },
    getMovesFromSquares (squares, piece, simulation) {
      const startPosition = _.clone(piece.position)
      let legalMoves = []
      let position = null

      squares.forEach(square => {
        position = _.clone(startPosition)
        position = { x: position.x + square.x, y: position.y + square.y }
        if (
          position.x < 8 && position.y < 8 && position.x >= 0 && position.y >= 0 &&
          !this.getPieceOnPos({ position, colors: [piece.color] })
        ) {
          legalMoves = this.addLegalMove(legalMoves, position, piece, simulation)

          const oppositePieceOnPos = this.getPieceOnPos({ position, colors: [this.oppositeColor(piece.color)], simulation })
          this.setCheckWhenKingOnPos(position, oppositePieceOnPos, simulation)
        }
      })

      return legalMoves
    },
    getPawnMoves (piece, simulation) {
      let position = null
      let legalMoves = []
      const startPawnPosition = piece.color === 'white' ? 6 : 1
      const maxFirstMove = piece.color === 'white' ? -2 : 2
      const maxMove = piece.color === 'white' ? -1 : 1

      // is no piece on the square ahead
      position = { x: piece.position.x, y: piece.position.y + maxMove }
      if (!this.getPieceOnPos({ position, simulation })) {
        legalMoves = this.addLegalMove(legalMoves, position, piece, simulation)

        // is pawn on the starting square and is no piece on the square ahead
        position = { x: piece.position.x, y: piece.position.y + maxFirstMove }
        if (
          piece.position.y === startPawnPosition &&
          !this.getPieceOnPos({ position, simulation })
        ) {
          legalMoves = this.addLegalMove(legalMoves, position, piece, simulation)
        }
      }

      // is opposite piece directly diagonal
      [1, -1].forEach(x => {
        position = { x: piece.position.x + x, y: piece.position.y + maxMove }
        const oppositePieceOnPos = this.getPieceOnPos({ position, colors: [this.oppositeColor(piece.color)], simulation })
        if (oppositePieceOnPos) {
          legalMoves = this.addLegalMove(legalMoves, position, piece, simulation)

          this.setCheckWhenKingOnPos(position, oppositePieceOnPos, simulation)
        }
      })

      return legalMoves
    },
    setAllLegalMovesForColor (color, simulation = false) {
      this.pieces[color].forEach(piece => {
        if (piece.position) {
          const moves = this.getLegalMoves(piece, simulation)

          if (!simulation && moves) this.setPieceMoves({ ...piece, moves })
        }
      })
    },
    getLegalMoves (piece, simulation) {
      let legalMoves = null

      switch (piece.name) {
        case 'pawn':
          legalMoves = this.getPawnMoves(piece, simulation)
          break

        case 'knight':
          var knightPositions = [
            { x: 2, y: 1 }, { x: 2, y: -1 }, { x: -2, y: 1 }, { x: -2, y: -1 },
            { x: 1, y: 2 }, { x: 1, y: -2 }, { x: -1, y: 2 }, { x: -1, y: -2 }
          ]
          legalMoves = this.getMovesFromSquares(knightPositions, piece, simulation)
          break

        case 'bishop':
          legalMoves = this.getMovesFromDirections(this.diagonal, piece, simulation)
          break

        case 'rook':
          legalMoves = this.getMovesFromDirections(this.straight, piece, simulation)
          break

        case 'queen':
          legalMoves = [
            ...this.getMovesFromDirections(this.diagonal, piece, simulation),
            ...this.getMovesFromDirections(this.straight, piece, simulation)
          ]
          break

        case 'king':
          legalMoves = this.getMovesFromSquares([...this.diagonal, ...this.straight], piece, simulation)
          break
      }

      if (this.getCheckState(this.activeColor)) {

      }

      return legalMoves
    },
    move (piece, newPos) {
      if (piece.moves && piece.color === this.activeColor) {
        const move = piece.moves.find(move => _.isEqual(move, newPos))

        if (move) {
          this.setCheckState({ color: piece.color, checkState: false })
          this.setPiecePosition({ ...piece, position: newPos })

          // is move a check, set check state
          this.getLegalMoves(this.getPiece({ ...piece }))

          this.changeActiveColor()
          this.setAllLegalMovesForColor(this.activeColor)
        }
      }

      return false
    }
  }
}
