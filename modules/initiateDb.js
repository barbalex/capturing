import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

import schema from '../dbSchema/schema'
// TODO: build models and import them
import {} from '../dbModel'

const initiateDb = (store) => {
  const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    onQuotaExceededError: () => {
      console.log('the browser ran out of disk space')
      store.addNotification({
        message:
          'Es gibt nicht genug Speicherplatz auf der Festplatte bzw. dem Browser steht nicht genug zur Verfügung.',
      })
    },
    onSetUpError: () => {
      // Database failed to load -- offer the user to reload the app or log out
      store.addNotification({
        message:
          'Die lokale Datenbank wurde nicht richtig initialisiert. Bitte laden Sie die App neu.',
      })
    },
  })

  const database = new Database({
    adapter,
    // TODO: add
    modelClasses: [],
  })

  return database
}

export default initiateDb
