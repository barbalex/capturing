import { types, destroy } from 'mobx-state-tree'
import { v1 as uuidv1 } from 'uuid'

import NotificationType from './Notification'

const myTypes = types
  .model({ notifications: types.map(NotificationType) })
  .volatile(() => ({ db: null }))
  .actions((self) => ({
    setDb(val) {
      self.db = val
    },
    destroy(model) {
      destroy(model)
    },
  }))
  .views((self) => ({
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
  }))

export default myTypes
