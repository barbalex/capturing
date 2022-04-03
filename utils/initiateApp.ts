import localForage from 'localforage'
import persist from 'mst-persist'
import isEqual from 'lodash/isEqual'

import activeNodeArrayFromUrl from './activeNodeArrayFromUrl'

const initiateApp = async ({ store, router }) => {
  const { query } = router
  console.log('initiateApp persisting mst, query:', query)
  const previousActiveNodeArray = [...store.activeNodeArray.slice()]
  const previousResetPassword = store.resetPassword
  await persist('store', store, {
    storage: localForage,
    jsonify: false,
    blacklist: [],
  })

  // TODO: need to navigate to activeNodeArray if is different from url

  console.log('initiateApp pathname:', router.pathname)
  const currentActiveNodeArray = activeNodeArrayFromUrl(router.pathname)
  // resetPassword was in the meantime set by Layout, in contained in url query
  if (previousResetPassword !== store.resetPassword) {
    store.setResetPassword(previousResetPassword)
  }
  if (!isEqual(currentActiveNodeArray, previousActiveNodeArray)) {
    router.push(`/${currentActiveNodeArray.join('/')}`)
  }
}

export default initiateApp
