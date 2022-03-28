import Dexie, { Table } from 'dexie'

export interface Account {
  id: string
  service_id?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface FieldType {
  value: string
  sort?: number
  comment?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface Field {
  id: string
  table_id?: string
  name?: string
  label?: string
  ord?: number
  is_internal_id?: boolean
  field_type?: string
  widget_type?: string
  options_table?: string
  standard_value?: string
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  deleted?: boolean
}
export interface FileRev {
  id: string
  row_id?: string
  file_id?: string
  field_id?: string
  filename?: string
  url?: string
  version?: number
  deleted?: boolean
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
}

export interface File {
  id: string
  row_id?: string
  field_id?: string
  filename?: string
  url?: string
  version?: number
  deleted?: boolean
  client_rev_at?: string
  client_rev_by?: string
  server_rev_at?: string
  rev?: string
  parent_rev?: string
  revisions?: string[]
  depth?: number
  conflicts?: string[]
}

export interface New {
  id: string
  time?: string
  version_type?: string
  version?: string
  message?: string
  server_rev_at?: string
  deleted?: boolean
}

// const {
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
export class db extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  accounts!: Table<Account>
  field_types!: Table<FieldType>
  fields!: Table<Field>
  file_revs!: Table<FileRev>
  files!: Table<File>
  news!: Table<New>

  constructor() {
    super('capturing')
    this.version(1).stores({
      accounts: '++id, deleted, server_rev_at',
      field_types: '++id, deleted, server_rev_at',
      field_types: '++id, label, ord, deleted, server_rev_at',
      file_revs: '++id, filename, deleted, server_rev_at',
      files: '++id, filename, deleted, server_rev_at',
      news: '++id, time, deleted, server_rev_at',
    })
  }
}
