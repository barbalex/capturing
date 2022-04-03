import { types } from 'mobx-state-tree'
import { v1 as uuidv1 } from 'uuid'

import NotificationType from './Notification'

const myTypes = types
  .model({
    activeNodeArray: types.optional(
      types.array(types.union(types.string, types.number)),
      [],
    ),
    openNodes: types.optional(
      types.array(types.array(types.union(types.string, types.number))),
      [],
    ),
    notifications: types.map(NotificationType),
    resetPassword: types.optional(types.boolean, false),
    singleColumnView: types.optional(types.boolean, false),
  })
  .volatile(() => ({ session: undefined }))
  .actions((self) => ({
    setResetPassword(val) {
      console.log('store setting resetPassword to:', val)
      self.resetPassword = val
    },
    setActiveNodeArray(val, nonavigate) {
      self.activeNodeArray = val
      if (!nonavigate) {
        navigate(`/Vermehrung/${val.join('/')}`)
        self.addOpenNode(val)
      }
    },
    setOpenNodes(val) {
      // need set to ensure contained arrays are unique
      const set = new Set(val.map(JSON.stringify))
      self.openNodes = Array.from(set).map(JSON.parse)
    },
    removeOpenNode(val) {
      self.openNodes = self.openNodes.filter((n) => !isEqual(n, val))
    },
    removeOpenNodeWithChildren(url) {
      self.openNodes = self.openNodes.filter((n) => {
        const urlPartWithEqualLength = n.slice(0, url.length)
        return !isEqual(urlPartWithEqualLength, url)
      })
    },
    addOpenNode(url) {
      // add all parent nodes
      let addedOpenNodes = []
      for (let i = 1; i <= url.length; i++) {
        addedOpenNodes.push(url.slice(0, i))
      }
      self.addOpenNodes(addedOpenNodes)
    },
    addOpenNodes(nodes) {
      // need set to ensure contained arrays are unique
      const set = new Set([...self.openNodes, ...nodes].map(JSON.stringify))
      const newOpenNodes = Array.from(set).map(JSON.parse)
      self.openNodes = newOpenNodes
    },
    setSession(val) {
      self.session = val
    },
    addNotification(valPassed) {
      const val = {
        // set default values
        id: uuidv1(),
        time: Date.now(),
        duration: 10000, // standard value: 10000
        dismissable: true,
        allDismissable: true,
        type: 'error',
        // overwrite with passed in ones:
        ...valPassed,
      }
      self.notifications.set(val.id, val)
      // remove after duration
      setTimeout(() => {
        self.removeNotificationById(val.id)
      }, val.duration)
    },
    removeNotificationById(id) {
      self.notifications.delete(id)
    },
    removeAllNotifications() {
      self.notifications.clear()
    },
    setSingleColumnView(val) {
      self.singleColumnView = val
    },
  }))
  .views((self) => ({
    get activeNodeArrayAsUrl() {
      return `/${self.activeNodeArray.join('/')}`
    },
  }))

export default myTypes
