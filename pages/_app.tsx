import { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import Head from 'next/head'
import isEqual from 'lodash/isEqual'
import { useRouter } from 'next/router'
import { observer } from 'mobx-react-lite'

import materialTheme from '../utils/materialTheme'
import '../globals.css'
import MobxStore from '../store'
import { Provider as MobxProvider } from '../storeContext'
import Layout from '../components/Layout'
import activeNodeArrayFromUrl from '../utils/activeNodeArrayFromUrl'

function MyApp({ Component, pageProps }: AppProps) {
  const [store, setStore] = useState()

  useEffect(() => {
    setStore(MobxStore.create())
  }, [])
  const router = useRouter()
  const { pathname } = router
  console.log('_app rendering')
  useEffect(() => {
    if (!store) return
    const previousActiveNodeArray = [...store.activeNodeArray.slice()]
    const previousResetPassword = store.resetPassword
    import('localforage').then((_localForage) => {
      import('mst-persist').then((_persist) => {
        _persist
          .default('store', store, {
            storage: _localForage.default,
            jsonify: false,
            blacklist: [],
          })
          .then(() => {
            // TODO: need to navigate to activeNodeArray if is different from url
            const currentActiveNodeArray = activeNodeArrayFromUrl(pathname)

            console.log('_app, effect', {
              previousActiveNodeArray,
              currentActiveNodeArray,
              query: router.query,
              resetPassword: store.resetPassword,
              previousResetPassword,
            })
            if (previousResetPassword !== store.resetPassword) {
              store.setResetPassword(previousResetPassword)
            }
            if (!isEqual(currentActiveNodeArray, previousActiveNodeArray)) {
              // TODO: navigate
              router.push(`/${currentActiveNodeArray.join('/')}`)
            }
          })
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  console.log('_app rendering')

  if (!store) return null

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={materialTheme}>
        <MobxProvider value={store}>
          <Head>
            <title>Capturing</title>
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </MobxProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default observer(MyApp)
