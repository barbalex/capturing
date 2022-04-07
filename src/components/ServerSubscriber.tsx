import { useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { db, db as dexie, IProject } from '../dexieClient'

const fallbackRevAt = '1970-01-01T00:01:0.0Z'

const ServerSubscriber = () => {
  // per table:
  // 1. get last_updated_at from dexie
  // 2. fetch all with newer last_updated_at
  // 3. update dexie with these changes
  // 4. subscribe for changes
  // 5. update dexie with changes from subscription
  // 6. deal with subscription problems due to: 1. internet outage 2. app moving to background 3. power saving mode
  //    see: https://github.com/supabase/supabase/discussions/5641

  useEffect(() => {
    const run = async () => {
      // 1. projects
      // 1.1. get last_updated_at from dexie
      const lastProject = await db.projects
        .orderBy('server_rev_at')
        .reverse()
        .first()
      console.log('ServerSubscriber, last project in dexie:', lastProject)
      const projectsLastUpdatedAt = lastProject?.server_rev_at ?? fallbackRevAt
      const { data: projectsData, error: projectsError } = await supabase
        .from<IProject>('projects')
        .select('*')
        .gte('server_rev_at', projectsLastUpdatedAt)
      if (projectsError) {
        console.log(
          'ServerSubscriber, error fetching projects from supabase:',
          projectsError,
        )
      }
      console.log(
        'ServerSubscriber, last projects fetched from supabase:',
        projectsData,
      )
      if (projectsData) {
        // TODO:
        // use https://dexie.org/docs/Table/Table.bulkPut()
        try {
          await dexie.projects.bulkPut(projectsData)
        } catch (error) {
          console.log('error putting projects:', error)
        }
      }
      supabase
        .from('projects')
        .on('*', (payload) => {
          console.log('projectsSubscription', payload)
          dexie.projects.put(payload.new)
        })
        .subscribe((status) => {
          console.log('projectsSubscription, status:', status)
        })
    }
    run()

    return () => {
      supabase.removeAllSubscriptions()
    }
  }, [])
}

export default ServerSubscriber
