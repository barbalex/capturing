import { types, onAction } from 'mobx-state-tree'
// import { autorun } from 'mobx'
import isEqual from 'lodash/isEqual'

import NotificationType from './Notification'
import EditingProjectType from './EditingProject'
import ShowLocalMapsType from './ShowLocalMaps'

// Idea: build tree with object / Nodes type containing only id/folderName?
// const Nodes = types.model({
//   id: types.string,
//   children: types.array(Nodes),
// })

export const MobxStore = types
  .model({
    editingProjects: types.map(EditingProjectType),
    activeNodeArray: types.optional(types.array(types.string), []),
    previousActiveNodeArray: types.optional(types.array(types.string), []),
    // lastTouchedNode is needed to keep the last clicked arrow known
    // so it does not jump
    // before using this, activeNodeArray was used instead
    // but then when an arrow out of sight of the active node
    // is clicked, the list jumps back to the active node :-(
    lastTouchedNode: types.optional(types.array(types.string), []),
    nodes: types.optional(types.array(types.array(types.string)), []),
    notifications: types.map(NotificationType),
    showTree: types.optional(types.boolean, true),
    showForm: types.optional(types.boolean, true),
    showMap: types.optional(types.boolean, false),
    mapZoom: types.optional(types.number, 0),
    mapInitiated: types.optional(types.boolean, false),
    singleColumnView: types.optional(types.boolean, false),
    showTreeInSingleColumnView: types.optional(types.boolean, false),
    subscriptionState: types.optional(
      types.enumeration(['SUBSCRIBED', 'INITIAL', 'CLOSED', 'CHANNEL_ERROR']),
      'INITIAL',
    ),
    filterWidth: types.optional(types.number, 500),
    online: types.optional(types.boolean, true),
    // setting bounds works imperatively with map.fitBounds since v3
    // but keeping bounds in store as last used bounds will be re-applied on next map opening
    bounds: types.optional(types.array(types.array(types.number)), [
      [47.159, 8.354],
      [47.696, 8.984],
    ]),
    tileLayerSorter: types.optional(types.string, ''),
    vectorLayerSorter: types.optional(types.string, ''),
    fieldSorter: types.optional(types.string, ''),
    treeRebuildCount: types.optional(types.number, 0),
    // needed to create animations when horizontally navigating
    horizontalNavIds: types.optional(types.array(types.string), []),
    localMapLoadingFraction: types.optional(types.number, 0),
    localMapLoadingFulfilled: types.optional(types.number, 0),
    localMapLoadingRejected: types.optional(types.number, 0),
    localMapShow: types.map(ShowLocalMapsType),
    diffConflict: types.optional(types.boolean, true),
    // needed to detect changes in session
    sessionCounter: types.optional(types.number, 0),
  })
  .volatile(() => ({
    navigate: undefined,
    map: undefined,
    localMaps: {}, // map of: {id,save,delete,size}
    // beware: change does not provoke rerender
    session: undefined,
  }))
  .actions((self) => {
    // autorun(() => {
    //   console.log(
    //     'store, horizontalNavIds changed to:',
    //     self.horizontalNavIds.toJSON(),
    //   )
    // })
    // autorun(() => {
    //   console.log('store, activeNodeArray changed to:', {
    //     activeNodeArray: self.activeNodeArray.slice(),
    //     previous: self.previousActiveNodeArray.slice(),
    //   })
    // })
    onAction(self, (call) => {
      if (call.name === 'setShowMap') self.setMapInitiated(true)
    })

    return {
      setLastTouchedNode(val) {
        self.lastTouchedNode = val
      },
      incrementSessionCounter() {
        self.sessionCounter = self.sessionCounter + 1
      },
      setSession(val) {
        self.session = val
      },
      setDiffConflict(val) {
        self.diffConflict = val
      },
      setMapZoom(val) {
        self.mapZoom = val
      },
      setLocalMapLoading(val) {
        self.localMapLoadingFulfilled = val?.fulfilled
        self.localMapLoadingRejected = val?.rejected
      },
      setLocalMapLoadingFraction(val) {
        self.localMapLoadingFraction = val
      },
      setLocalMap(val) {
        self.localMaps[val.id] = val
      },
      // size is not being used now
      // could be used to more accurately calculate downloaded size?
      setLocalMapValues({ id, save, del, size }) {
        self.localMaps[id] = {
          ...self.localMaps[id],
          ...(save ? { save } : {}),
          ...(del ? { del } : {}),
          ...(size ? { size } : {}),
        }
      },
      flyToMapBounds(bounds) {
        // this exists because:
        // zoom to row can be clicked BEFORE map was instantiated
        // so need to fly to bounds after a timeout
        self.map.flyToBounds(bounds)
      },
      setHorizontalNavIds(val) {
        // console.log('store, setHorizontalNavIds, val:', val)
        if (!val) {
          if (!self.horizontalNavIds.length) return
          return (self.horizontalNavIds = [])
        }
        if (isEqual(val, self.horizontalNavIds)) {
          return
        }
        self.horizontalNavIds = val
      },
      setMapInitiated(val: boolean): void {
        self.mapInitiated = val
      },
      rebuildTree(): void {
        self.treeRebuildCount = self.treeRebuildCount + 1
      },
      setTreeRebuildCount(val: number): void {
        self.treeRebuildCount = val
      },
      setMap(val: Map): void {
        self.map = val
      },
      setTileLayerSorter(val: string): void {
        self.tileLayerSorter = val
      },
      setVectorLayerSorter(val: string): void {
        self.vectorLayerSorter = val
      },
      setFieldSorter(val: string): void {
        self.fieldSorter = val
      },
      setBounds(val): void {
        self.bounds = val
      },
      setShowTree(val: boolean): void {
        self.showTree = val
      },
      setShowForm(val: boolean): void {
        self.showForm = val
      },
      setShowMap(val: boolean): void {
        self.showMap = val
      },
      setLocalMapShow({ id, show }: { id: string; show: boolean }): void {
        self.localMapShow.set(id, { id, show })
      },
      setProjectEditing({
        id,
        editing,
      }: {
        id: string
        editing: boolean
      }): void {
        self.editingProjects.set(id, { id, editing })
      },
      setOnline(val: boolean): void {
        self.online = val
      },
      setFilterWidth(val: number): void {
        self.filterWidth = val
      },
      setShowTreeInSingleColumnView(val: boolean): void {
        self.showTreeInSingleColumnView = val
      },
      setSubscriptionState(val: 'SUBSCRIBED' | 'INITIAL'): void {
        self.subscriptionState = val
      },
      setNavigate(val: NavigateFunction): void {
        return (self.navigate = val)
      },
      addNodesForNodeArray(nodeArray): void {
        const extraOpenNodes = []
        nodeArray.forEach((v, i) => {
          extraOpenNodes.push(nodeArray.slice(0, i + 1))
        })
        this.addNodes(extraOpenNodes)
      },
      setActiveNodeArray(val: string[]): void {
        if (isEqual(val, self.activeNodeArray)) {
          // do not do this if already set
          // trying to stop vicious cycle of reloading in first start after update
          return
        }
        self.previousActiveNodeArray = self.activeNodeArray.slice()
        // always set missing open nodes?
        self.addNodesForNodeArray(val)
        self.activeNodeArray = val
      },
      setNodes(val): void {
        // need set to ensure contained arrays are unique
        const set = new Set(val.map(JSON.stringify))
        self.nodes = Array.from(set).map(JSON.parse)
      },
      removeNode(val): void {
        self.nodes = self.nodes.filter((n) => !isEqual(n, val))
      },
      removeNodeWithChildren(url: string[]): boolean {
        self.nodes = self.nodes.filter((n) => {
          const urlPartWithEqualLength = n.slice(0, url.length)
          return !isEqual(urlPartWithEqualLength, url)
        })
      },
      removeNodesChildren(url: string[]) {
        self.nodes = self.nodes.filter((n) => {
          const urlPartWithEqualLength = n.slice(0, url.length + 1)
          return !isEqual(urlPartWithEqualLength, url)
        })
      },
      addNode(url: string[]): void {
        // add all parent nodes
        const addedOpenNodes = []
        for (let i = 1; i <= url.length; i++) {
          addedOpenNodes.push(url.slice(0, i))
        }
        self.addNodes(addedOpenNodes)
      },
      addNodes(nodes): void {
        // need set to ensure contained arrays are unique
        const set = new Set([...self.nodes, ...nodes].map(JSON.stringify))
        const newOpenNodes = Array.from(set).map(JSON.parse)
        self.nodes = newOpenNodes
      },
      addNotification(valPassed): string {
        const val = {
          // set default values
          id: window.crypto.randomUUID(),
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
        return val.id
      },
      removeNotificationById(id: string): void {
        // does not seem to work for many???
        self.notifications.delete(id)
      },
      removeAllNotifications(): void {
        self.notifications.clear()
      },
      setSingleColumnView(val: boolean): void {
        self.singleColumnView = val
      },
    }
  })
  .views((self) => ({
    get activeNodeArrayAsUrl(): string {
      return `/${self.activeNodeArray.join('/')}`
    },
    get serverConnected(): boolean {
      // not sure if this is really helpful
      return self.subscriptionState === 'SUBSCRIBED'
    },
  }))

export type IStore = Instance<typeof MobxStore>
export type IStoreSnapshotIn = SnapshotIn<typeof MobxStore>
export type IStoreSnapshotOut = SnapshotOut<typeof MobxStore>
