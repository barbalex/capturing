import localForage from 'localforage'
import persist from 'mst-persist'
import isEqual from 'lodash/isEqual'

import activeNodeArrayFromUrl from './activeNodeArrayFromUrl'

const initiateApp = async ({ store }) => {
  console.log('initiateApp persisting mst')
  await persist('store', store, {
    storage: localForage,
    jsonify: false,
    blacklist: [],
  })
  store.setStoreRestored('checkActiveNodeArray')
  // can't navigate to potentially new activeNodeArray here
  // because navigate can't be loaded in App.tsx without messing with rendering
  // this this happens in Layout.tsx
}

export default initiateApp
