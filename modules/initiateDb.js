import Dexie, { Table } from 'dexie'
import { definitions, paths } from '../types/supabase'

const initiateDb = (store) => {
  // const {
  //   accounts,
  //   field_types,
  //   fields,
  //   file_revs,
  //   files,
  //   news,
  //   news_delivery,
  //   option_types,
  //   project_editors,
  //   project_managers,
  //   project_readers,
  //   project_tile_layers,
  //   project_users,
  //   projects,
  //   rel_types,
  //   role_types,
  //   row_revs,
  //   rows,
  //   tables,
  //   tile_layers,
  //   users,
  //   version_types,
  //   widget_types,
  //   widgets_for_fields,
  // } = definitions
  console.log('initiateDb, definitions:', { definitions, paths })
  const db = new Dexie('capturing')
  return db
}

export default initiateDb
