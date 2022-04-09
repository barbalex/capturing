import { types } from 'mobx-state-tree'
// import { autorun } from 'mobx'
import { v1 as uuidv1 } from 'uuid'
import isEqual from 'lodash/isEqual'

import NotificationType from './Notification'

export const MobxStore = types
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
    singleColumnView: types.optional(types.boolean, false),
    showTreeInSingleColumnView: types.optional(types.boolean, false),
    treeWidthInPercentOfScreen: types.optional(types.number, 33),
    subscriptionState: types.optional(types.string, 'INITIAL'),
    treeWidth: types.optional(types.number, 500),
    formWidth: types.optional(types.number, 500),
    formHeight: types.optional(types.number, 500),
    filterWidth: types.optional(types.number, 500),
  })
  .volatile(() => ({ navigate: undefined }))
  .actions((self) => {
    // autorun(() =>
    //   console.log(
    //     'store, activeNodeArray changed to:',
    //     self.activeNodeArray.slice(),
    //   ),
    // )

    return {
      setTreeWidth(val) {
        self.treeWidth = val
      },
      setFormWidth(val) {
        self.formWidth = val
      },
      setFormHeight(val) {
        self.formHeight = val
      },
      setFilterWidth(val) {
        self.filterWidth = val
      },
      setTreeWidthInPercentOfScreen(val) {
        self.treeWidthInPercentOfScreen = val
      },
      setShowTreeInSingleColumnView(val) {
        self.showTreeInSingleColumnView = val
      },
      setSubscriptionState(val) {
        self.subscriptionState = val
      },
      setNavigate(val) {
        return (self.navigate = val)
      },
      setActiveNodeArray(val, nonavigate) {
        self.activeNodeArray = val
        if (!nonavigate) {
          if (self?.navigate) {
            self.navigate(`/${val.join('/')}`)
            return self.addOpenNode(val)
          }
          console.log(
            'store, self.navigate is undefined, wanted to navigate to:',
            val,
          )
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
        const addedOpenNodes = []
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
    }
  })
  .views((self) => ({
    get activeNodeArrayAsUrl() {
      return `/${self.activeNodeArray.join('/')}`
    },
    get serverConnected() {
      return self.subscriptionState === 'SUBSCRIBED'
    },
  }))

// this errors: Uncaught SyntaxError: Unexpected token 'export'
// export interface IStore extends Instance<typeof MobxStore> {}
