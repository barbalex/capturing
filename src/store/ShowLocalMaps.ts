import { types } from 'mobx-state-tree'

export default types.model('ShowLocalMaps', {
  id: types.identifier,
  show: types.boolean,
})
