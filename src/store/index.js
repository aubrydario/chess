import Vue from 'vue'
import Vuex from 'vuex'

import _ from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    activeColor: 'white',
    checkState: {
      white: false,
      black: false
    },
    simulationCheckState: false,
    simulationPieces: null,
    pieces: {
      white: [
        { id: 1, name: 'queen', position: { x: 3, y: 7 }, moves: null },
        { id: 1, name: 'king', position: { x: 4, y: 7 }, moves: null },
        { id: 1, name: 'pawn', position: { x: 0, y: 6 }, moves: null },
        { id: 2, name: 'pawn', position: { x: 1, y: 6 }, moves: null },
        { id: 3, name: 'pawn', position: { x: 2, y: 6 }, moves: null },
        { id: 4, name: 'pawn', position: { x: 3, y: 6 }, moves: null },
        { id: 5, name: 'pawn', position: { x: 4, y: 6 }, moves: null },
        { id: 6, name: 'pawn', position: { x: 5, y: 6 }, moves: null },
        { id: 7, name: 'pawn', position: { x: 6, y: 6 }, moves: null },
        { id: 8, name: 'pawn', position: { x: 7, y: 6 }, moves: null },
        { id: 1, name: 'bishop', position: { x: 5, y: 7 }, moves: null },
        { id: 2, name: 'bishop', position: { x: 2, y: 7 }, moves: null },
        { id: 1, name: 'knight', position: { x: 1, y: 7 }, moves: null },
        { id: 2, name: 'knight', position: { x: 6, y: 7 }, moves: null },
        { id: 1, name: 'rook', position: { x: 0, y: 7 }, moves: null },
        { id: 2, name: 'rook', position: { x: 7, y: 7 }, moves: null }
      ],
      black: [
        { id: 1, name: 'queen', position: { x: 3, y: 0 }, moves: null },
        { id: 1, name: 'king', position: { x: 4, y: 0 }, moves: null },
        { id: 1, name: 'pawn', position: { x: 0, y: 1 }, moves: null },
        { id: 2, name: 'pawn', position: { x: 1, y: 1 }, moves: null },
        { id: 3, name: 'pawn', position: { x: 2, y: 1 }, moves: null },
        { id: 4, name: 'pawn', position: { x: 3, y: 1 }, moves: null },
        { id: 5, name: 'pawn', position: { x: 4, y: 1 }, moves: null },
        { id: 6, name: 'pawn', position: { x: 5, y: 1 }, moves: null },
        { id: 7, name: 'pawn', position: { x: 6, y: 1 }, moves: null },
        { id: 8, name: 'pawn', position: { x: 7, y: 1 }, moves: null },
        { id: 1, name: 'bishop', position: { x: 5, y: 0 }, moves: null },
        { id: 2, name: 'bishop', position: { x: 2, y: 0 }, moves: null },
        { id: 1, name: 'knight', position: { x: 1, y: 0 }, moves: null },
        { id: 2, name: 'knight', position: { x: 6, y: 0 }, moves: null },
        { id: 1, name: 'rook', position: { x: 0, y: 0 }, moves: null },
        { id: 2, name: 'rook', position: { x: 7, y: 0 }, moves: null }
      ]
    }
  },
  mutations: {
    'SET_PIECE_POSITION' (state, { piece, position }) {
      piece.position = position
    },
    'SET_CHECK_STATE' (state, { color, checkState }) {
      state.checkState[color] = checkState
    },
    'CHANGE_ACTIVE_COLOR' (state) {
      state.activeColor = state.activeColor === 'white' ? 'black' : 'white'
    },
    'SET_PIECE_MOVES' (state, { piece, moves }) {
      piece.moves = moves
    },
    'SET_SIMULATION_CHECK_STATE' (state, checkState) {
      state.simulationCheckState = checkState
    },
    'SET_SIMULATION_PIECES' (state) {
      state.simulationPieces = _.cloneDeep(state.pieces)
    }
  },
  actions: {
    setPiecePosition ({ commit, state, getters }, { id, color, name, position }) {
      const piece = getters.getPiece({ id, name, color })
      commit('SET_PIECE_POSITION', { piece, position })
    },
    setSimulationPiecePosition ({ commit, state, getters }, { id, color, name, position }) {
      commit('SET_SIMULATION_PIECES')
      const simulationPiece = getters.getPiece({ id, name, color, simulation: true })
      commit('SET_PIECE_POSITION', { piece: simulationPiece, position })
    },
    setPieceMoves ({ commit, state, getters }, { id, color, name, moves }) {
      const piece = getters.getPiece({ id, name, color })
      commit('SET_PIECE_MOVES', { piece, moves })
    }
  },
  getters: {
    getPiece: state => ({ id, name, color, simulation }) => {
      simulation = simulation || false
      color = color || state.activeColor
      let piece = state.pieces[color].find(piece => piece.name === name && piece.id === id)

      if (simulation) {
        piece = state.simulationPieces[color].find(piece => piece.name === name && piece.id === id)
      }

      piece.color = color

      return piece
    },
    getPieceOnPos: state => ({ position, colors, simulation }) => {
      colors = colors || ['white', 'black']
      let piece = null

      if (simulation) {
        colors.some(color => {
          piece = state.simulationPieces[color]
            .find(piece => piece.position && piece.position.x === position.x && piece.position.y === position.y)
        })
      } else {
        colors.some(color => {
          piece = state.pieces[color]
            .find(piece => piece.position && piece.position.x === position.x && piece.position.y === position.y)
        })
      }

      return piece
    },
    getCheckState: state => color => {
      color = color || state.activeColor
      return state.checkState[color]
    },
    getSimulationCheckState: state => () => {
      return state.simulationCheckState
    },
    getAllLegalMovesForColor: state => color => {
      const movesArray = []
      state.pieces[color].forEach(piece => {
        movesArray.push(...piece.moves)
      })

      return movesArray
    }
  }
})
