import { types } from 'mobx-state-tree'
// import { autorun } from 'mobx'
import { v1 as uuidv1 } from 'uuid'
import isEqual from 'lodash/isEqual'

import NotificationType from './Notification'

const EditingProject = types.model('EditingProject', {
  id: types.identifier,
  editing: types.boolean,
})

// Idea: build tree with object / Nodes type containing only id/folderName?
// const Nodes = types.model({
//   id: types.string,
//   children: types.array(Nodes),
// })

export const MobxStore = types
  .model({
    editingProjects: types.map(EditingProject),
    activeNodeArray: types.optional(
      types.array(types.union(types.string, types.number)),
      [],
    ),
    // TODO: this is really visibleNodes i.e. nodes
    nodes: types.optional(
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
    online: types.optional(types.boolean, true),
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
      setProjectEditing({ id, editing }) {
        self.editingProjects.set(id, { id, editing })
      },
      setOnline(val) {
        self.online = val
      },
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
      setActiveNodeArray(val) {
        self.activeNodeArray = val
      },
      setNodes(val) {
        // need set to ensure contained arrays are unique
        const set = new Set(val.map(JSON.stringify))
        self.nodes = Array.from(set).map(JSON.parse)
      },
      removeNode(val) {
        self.nodes = self.nodes.filter((n) => !isEqual(n, val))
      },
      removeNodeWithChildren(url) {
        self.nodes = self.nodes.filter((n) => {
          const urlPartWithEqualLength = n.slice(0, url.length)
          return !isEqual(urlPartWithEqualLength, url)
        })
      },
      addNode(url) {
        // add all parent nodes
        const addedOpenNodes = []
        for (let i = 1; i <= url.length; i++) {
          addedOpenNodes.push(url.slice(0, i))
        }
        self.addNodes(addedOpenNodes)
      },
      addNodes(nodes) {
        // need set to ensure contained arrays are unique
        const set = new Set([...self.nodes, ...nodes].map(JSON.stringify))
        const newOpenNodes = Array.from(set).map(JSON.parse)
        self.nodes = newOpenNodes
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
      // not sure if this is really helpful
      return self.subscriptionState === 'SUBSCRIBED'
    },
  }))

// this errors: Uncaught SyntaxError: Unexpected token 'export'
// export interface IStore extends Instance<typeof MobxStore> {}
