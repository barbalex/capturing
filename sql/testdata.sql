INSERT INTO users (id, name, email, auth_id, client_rev_by)
  VALUES ('a1830c80-824d-11eb-8dcd-0242ac130003', 'test tester', 'test@tester.ch', 'ba4964bc-824d-11eb-8dcd-0242ac130003', 'test@tester.ch');

INSERT INTO accounts (id, service_id, client_rev_by)
  VALUES ('b3c51c30-824d-11eb-8dcd-0242ac130003', '15536cc2-824e-11eb-8dcd-0242ac130003', 'test@tester.ch');

UPDATE
  users
SET
  account_id = 'b3c51c30-824d-11eb-8dcd-0242ac130003'
WHERE
  id = 'a1830c80-824d-11eb-8dcd-0242ac130003';

INSERT INTO projects (id, account_id, name, label, client_rev_by)
  VALUES ('b3188c9e-824e-11eb-8dcd-0242ac130003', 'b3c51c30-824d-11eb-8dcd-0242ac130003', 'test_project', 'test-project 1', 'test@tester.ch');

INSERT INTO project_users (id, project_id, user_email, ROLE, client_rev_by)
  VALUES ('11c01c30-824f-11eb-8dcd-0242ac130003', 'b3188c9e-824e-11eb-8dcd-0242ac130003', 'test2@tester.ch', 'account_manager', 'test@tester.ch');

INSERT INTO tables (id, project_id, name, label, client_rev_by)
  VALUES ('961c4cba-824f-11eb-8dcd-0242ac130003', 'b3188c9e-824e-11eb-8dcd-0242ac130003', 'test_table_1', 'test-table 1', 'test@tester.ch');
INSERT INTO tables (id, project_id, name, label, client_rev_by)
  VALUES ('d6fd19cb-214a-41c0-baea-9c9516c792ef', 'b3188c9e-824e-11eb-8dcd-0242ac130003', 'test_table_2', 'test-table 2', 'test@tester.ch');

INSERT INTO fields (id, table_id, name, label, field_type, widget_type, client_rev_by)
  VALUES ('ed1bd6c0-824f-11eb-8dcd-0242ac130003', '961c4cba-824f-11eb-8dcd-0242ac130003', 'field_1', 'field 1', 'text', 'text', 'test@tester.ch'), ('25d1ec5c-8250-11eb-8dcd-0242ac130003', '961c4cba-824f-11eb-8dcd-0242ac130003', 'field_2', 'field 2', 'integer', 'text', 'test@tester.ch');

INSERT INTO row_revs (row_id, table_id, data, client_rev_by)
  VALUES ('a5aeaa00-8250-11eb-8dcd-0242ac130003', '961c4cba-824f-11eb-8dcd-0242ac130003', '{"field_1": "test in field 1", "field_2": "test in field 2"}', 'test@tester.ch');

INSERT INTO row_revs (row_id, table_id, data, client_rev_by, rev, revisions, depth)
  VALUES ('a5aeaa00-8250-11eb-8dcd-0242ac130003', '961c4cba-824f-11eb-8dcd-0242ac130003', '{"field_1": "test in field 1, verändert", "field_2": "test in field 2"}', 'test@tester.ch', '1-1602ce5d8b68fd0172ef11a2598eedfe', '{"1-1602ce5d8b68fd0172ef11a2598eedfe"}', 1);

INSERT INTO file_revs (file_id, row_id, field_id, filename, version, client_rev_by)
  VALUES ('93c4dac0-8274-11eb-8dcd-0242ac130003', 'a5aeaa00-8250-11eb-8dcd-0242ac130003', 'ed1bd6c0-824f-11eb-8dcd-0242ac130003', 'test-filename', 1, 'test@tester.ch');

INSERT INTO file_revs (file_id, row_id, field_id, filename, version, client_rev_by, rev, revisions, depth)
  VALUES ('93c4dac0-8274-11eb-8dcd-0242ac130003', 'a5aeaa00-8250-11eb-8dcd-0242ac130003', 'ed1bd6c0-824f-11eb-8dcd-0242ac130003', 'test-filename changed', 1, 'test@tester.ch', '1-c407553f4c296c44ddd2b8c24ef847a7
', '{"1-c407553f4c296c44ddd2b8c24ef847a7"}', 1);

insert into widget_types (value, sort, comment, needs_list)
values
  ('text',1,'Short field accepting text',false),
  ('textarea',2,'Field accepting text, lines can break',false),
  ('markdown',3,'Field accepting text, expressing markdown',false),
  ('options-2',4,'boolean field showing true and false (not null)',false),
  ('options-3',5,'boolean field showing true, false and null',false),
  ('datepicker',8,'enables choosing a date',false),
  ('filepicker',9,'enables choosing files',false),
  ('imagepicker',10,'enables choosing images',false),
  ('dropdown',7,'dropdown-list (choose single)',true),
  ('radio-group',6,'short list, showing every entry (choose single)',true);


insert into widgets_for_fields (field_value, widget_value)
values ('text', 'text'), ('text', 'textarea'), ('text', 'markdown'), ('text', 'radio-group'), ('text', 'dropdown'), ('boolean', 'options-2'), ('boolean', 'options-3'), ('integer', 'text'), ('integer', 'radio-group'), ('integer', 'dropdown'), ('decimal', 'text'), ('date', 'datepicker'), ('date-time', 'datepicker'), ('file-reference', 'filepicker'), ('file-reference', 'imagepicker');

insert into option_types (value, save_id, sort, comment)
values 
  ('none', false, 1, 'This table does not contain a list of options meant to be choosen for a field of another table'),
  ('List of Values', false, 2, 'The choosen value is saved in the field of another table'),
  ('List of values with id', true, 3, 'When a value is choosen, it''s id is saved in the field of another table');
