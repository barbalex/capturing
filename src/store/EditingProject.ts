import { types } from 'mobx-state-tree'

export default types.model('EditingProject', {
  id: types.identifier,
  editing: types.boolean,
})
