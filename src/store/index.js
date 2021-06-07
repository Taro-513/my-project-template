import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loadingState: 0,
    httpRequestList:[]
  },
  mutations: {
    changeLoading(state, data) {
      data ? ++state.loadingState : --state.loadingState
      if (state.loadingState <0) state.loadingState = 0
    },
    resetLoading(state, data) {
      state.loadingState = data || 0
    },
    setHttpRequestList (state, data) {
      state.httpRequestList = data
    }
  },
  actions: {
  },
  modules: {
  },
  getters:{
    loadingState(state) {
      return !!state.loadingState
    },
  }
})
