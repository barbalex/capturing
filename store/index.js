import { types, destroy } from 'mobx-state-tree'

const myTypes = types
  .model({})
  .volatile(() => ({}))
  .actions((self) => ({
    destroy(model) {
      destroy(model)
    },
  }))
  .views((self) => ({}))

export default myTypes
