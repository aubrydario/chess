import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    activeColor: 'white',
    checkState: {
      white: false,
      black: false
    },
    pieces: {
      white: [
        { id: 1, name: 'queen', position: { x: 3, y: 7 } },
        { id: 1, name: 'king', position: { x: 4, y: 7 } },
        { id: 1, name: 'pawn', position: { x: 0, y: 6 } },
        { id: 2, name: 'pawn', position: { x: 1, y: 6 } },
        { id: 3, name: 'pawn', position: { x: 2, y: 6 } },
        { id: 4, name: 'pawn', position: { x: 3, y: 6 } },
        { id: 5, name: 'pawn', position: { x: 4, y: 6 } },
        { id: 6, name: 'pawn', position: { x: 5, y: 6 } },
        { id: 7, name: 'pawn', position: { x: 6, y: 6 } },
        { id: 8, name: 'pawn', position: { x: 7, y: 6 } },
        { id: 1, name: 'bishop', position: { x: 5, y: 7 } },
        { id: 2, name: 'bishop', position: { x: 2, y: 7 } },
        { id: 1, name: 'knight', position: { x: 1, y: 7 } },
        { id: 2, name: 'knight', position: { x: 6, y: 7 } },
        { id: 1, name: 'rook', position: { x: 0, y: 7 } },
        { id: 2, name: 'rook', position: { x: 7, y: 7 } }
      ],
      black: [
        { id: 1, name: 'queen', position: { x: 3, y: 0 } },
        { id: 1, name: 'king', position: { x: 4, y: 0 } },
        { id: 1, name: 'pawn', position: { x: 0, y: 1 } },
        { id: 2, name: 'pawn', position: { x: 1, y: 1 } },
        { id: 3, name: 'pawn', position: { x: 2, y: 1 } },
        { id: 4, name: 'pawn', position: { x: 3, y: 1 } },
        { id: 5, name: 'pawn', position: { x: 4, y: 1 } },
        { id: 6, name: 'pawn', position: { x: 5, y: 1 } },
        { id: 7, name: 'pawn', position: { x: 6, y: 1 } },
        { id: 8, name: 'pawn', position: { x: 7, y: 1 } },
        { id: 1, name: 'bishop', position: { x: 5, y: 0 } },
        { id: 2, name: 'bishop', position: { x: 2, y: 0 } },
        { id: 1, name: 'knight', position: { x: 1, y: 0 } },
        { id: 2, name: 'knight', position: { x: 6, y: 0 } },
        { id: 1, name: 'rook', position: { x: 0, y: 0 } },
        { id: 2, name: 'rook', position: { x: 7, y: 0 } }
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
    }
  },
  actions: {
    setPiecePosition ({ commit, state, getters }, { id, color, name, position }) {
      const piece = getters.getPiece({ id, name, color })
      commit('SET_PIECE_POSITION', { piece, position })
    }
  },
  getters: {
    getPiece: state => ({ id, name, color }) => {
      color = color || state.activeColor
      return state.pieces[color].find(piece => piece.name === name && piece.id === id)
    },
    isPieceOnPos: state => position => {
      const colors = ['white', 'black']
      return colors.some(color => {
        return state.pieces[color]
          .find(piece => piece.position && piece.position.x === position.x && piece.position.y === position.y)
      })
    },
    getCheckState: state => color => {
      color = color || state.activeColor
      return state.checkState[color]
    }
  }
})
