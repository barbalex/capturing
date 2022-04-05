import localForage from 'localforage'
import persist from 'mst-persist'
import isEqual from 'lodash/isEqual'

import activeNodeArrayFromUrl from './activeNodeArrayFromUrl'

const initiateApp = async ({ store, router }) => {
  console.log('initiateApp persisting mst')
  const previousActiveNodeArray = [...store.activeNodeArray.slice()]
  const previousResetPassword = store.resetPassword
  await persist('store', store, {
    storage: localForage,
    jsonify: false,
    blacklist: [],
  })

  // TODO: need to navigate to activeNodeArray if is different from url
  const currentActiveNodeArray = activeNodeArrayFromUrl(router.pathname)
  console.log('initiateApp:', {
    previousActiveNodeArray,
    currentActiveNodeArray,
  })
  if (!isEqual(currentActiveNodeArray, previousActiveNodeArray)) {
    router.push(`/${currentActiveNodeArray.join('/')}`)
  }
}

export default initiateApp
