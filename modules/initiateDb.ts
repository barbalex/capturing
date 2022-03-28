import Dexie, { Table } from 'dexie'


export interface Account {
  id: string;
  service_id?: string;
  client_rev_at?: string;
  client_rev_by?: string;
  server_rev_at?: string;
  deleted?: boolean;
}
export interface FieldType {
  value: string;
  sort?: number;
  comment?: string;
  server_rev_at?: string;
  deleted?: boolean;
}

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
  export class db extends Dexie {
    // 'friends' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    accounts!: Table<Account>; 
    field_types!: Table<FieldType>
  
    constructor() {
      super('capturing');
      this.version(1).stores({
        accounts: '++id, deleted, server_rev_at',
        field_types: '++id, deleted, server_rev_at'
      });
    }
  }

