pragma foreign_keys = ON;

begin;

/*********Drop / delete existing tables*********/
delete from jsharmony.note;
delete from jsharmony.cust_user_role;
delete from jsharmony.cust_user;
delete from jsharmony.code where code_name='cust_sts';

drop table if exists all_controls;
drop table if exists all_types;
drop table if exists category;
drop view if exists v_cust_contact;
drop view if exists v_cust;
drop table if exists item;
drop table if exists cust_flag;
drop table if exists cust_contact;
drop table if exists cust_addr;
drop table if exists cust_ext;
drop table if exists cust;
drop table if exists soundex;

drop table if exists code_cust_sts;
drop table if exists code_cust_flag_type;

/*********soundex*********/
create table soundex (
  soundex_id integer primary key autoincrement not null,
  table_name text not null,
  field_name text not null,
  table_id text not null,
  soundex_word text not null,
  soundex_val text not null
);

/*********code_cust_sts*********/
create_code('code_cust_sts');
INSERT INTO jsharmony_code (code_name, code_desc) VALUES ('cust_sts', 'Customer Status');
insert into code_cust_sts(code_seq,code_val,code_txt,code_code,code_end_dt) values (1,'DEACTIVE','Deactivated','A','2017-11-19');
insert into code_cust_sts(code_seq,code_val,code_txt,code_code) values (2,'ACTIVE','Active','A');
insert into code_cust_sts(code_seq,code_val,code_txt,code_code) values (3,'INACTIVE','Inactive','A');
insert into code_cust_sts(code_seq,code_val,code_txt,code_code) values (4,'CREDITH','Credit Hold','A');
insert into code_cust_sts(code_seq,code_val,code_txt,code_code) values (6,'CLOSED','Closed','C');
insert into code_cust_sts(code_seq,code_val,code_txt,code_code) values (5,'HOLD','Hold','C');

/*********code_cust_flag_type*********/
create_code('code_cust_flag_type');
INSERT INTO jsharmony_code (code_name, code_desc) VALUES ('cust_flag_type', 'Customer Flag Type');
insert into code_cust_flag_type(code_seq,code_val,code_txt) values (1,'PREF','Preferred');
insert into code_cust_flag_type(code_seq,code_val,code_txt) values (2,'CRDTRISK','Credit Risk');
insert into code_cust_flag_type(code_seq,code_val,code_txt) values (3,'PAPER','Paper-only');
insert into code_cust_flag_type(code_seq,code_val,code_txt,code_end_dt) values (4,'DEDIREP','Dedicated Rep','2017-11-19' );

/*********cust*********/
create table cust (
  cust_id integer primary key autoincrement not null,
  cust_sts text not null default 'ACTIVE',
  cust_name text not null unique,
  cust_email text,
  cust_ein blob,
  cust_einhash blob,
  cust_doc_ext text,
  cust_doc_size integer,
  cust_doc_uptstmp text,
  cust_doc_upuser text,
  cust_desc text,
  cust_portal_welcome_txt text,
  cust_start_dt text,
  cust_overdue_amt text,
  cust_parent_id integer null,
  cust_entry_user text,
  cust_entry_tstmp text,
  cust_update_dt text,
  foreign key (cust_sts) references code_cust_sts(code_val),
  foreign key (cust_parent_id) references cust(cust_id)
);
create trigger cust_after_insert after insert on cust
begin
  update cust set 
    cust_entry_user  = (select context from jsharmony_meta limit 1),
    cust_entry_tstmp = datetime('now','localtime')
    where rowid = new.rowid\;
  delete from soundex where table_name='cust' and table_id=NEW.cust_id\;
  update jsharmony_meta set jsexec = '{ "function": "soundex", "source": "(select cust_name from cust where cust_id='||NEW.cust_id||')", "dest": "insert into soundex(table_name,field_name,table_id,soundex_word,soundex_val) values(''cust'',''cust_name'','||NEW.cust_id||',(select cust_name from cust where cust_id='||NEW.cust_id||'),%%%SOUNDEX%%%)" }'\;
end;
create trigger cust_after_update after update on cust
begin
  delete from soundex where table_name='cust' and table_id=OLD.cust_id\;
  update jsharmony_meta set jsexec = '{ "function": "soundex", "source": "(select cust_name from cust where cust_id='||NEW.cust_id||')", "dest": "insert into soundex(table_name,field_name,table_id,soundex_word,soundex_val) values(''cust'',''cust_name'','||NEW.cust_id||',(select cust_name from cust where cust_id='||NEW.cust_id||'),%%%SOUNDEX%%%)" }'\;
end;
insert into cust(cust_id,cust_sts,cust_name,cust_desc,cust_start_dt,cust_overdue_amt,cust_email,cust_portal_welcome_txt,cust_doc_ext,cust_doc_size,cust_doc_uptstmp,cust_doc_upuser) values (1,'DEACTIVE','ACME Industries','Industrial Fixtures','2019-05-01','1234567.12','user@example.com','<b>Sample</b> HTML<br/><img src="data:image/png\;base64,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">','.jpg',14434,datetime('now', 'localtime'),'system');
insert into cust(cust_id,cust_sts,cust_name,cust_desc,cust_start_dt,cust_overdue_amt,cust_parent_id) values (2,'ACTIVE','Creative Engineering','','2019-05-01','0',1);
insert into cust(cust_id,cust_sts,cust_name,cust_desc,cust_start_dt,cust_overdue_amt,cust_doc_ext,cust_doc_size,cust_doc_uptstmp,cust_doc_upuser) values (3,'ACTIVE','Coffee Brothers','',null,'90.9','.jpg',521480,'2019-05-01','system');

/*********cust_ext*********/
create table cust_ext (
  cust_id integer primary key not null,
  cust_ext_desc text null,
  foreign key (cust_id) references cust(cust_id)
);
insert into cust_ext(cust_id,cust_ext_desc) values (1,'Extended Description');


/*********cust_addr*********/
create table cust_addr (
  cust_addr_id integer primary key autoincrement not null,
  cust_id integer not null,
  cust_addr_line1 text null,
  cust_addr_line2 text null,
  cust_addr_city text not null,
  cust_addr_state text not null,
  cust_addr_zip text null,
  cust_addr_country text not null,
  cust_addr_type text null,
  foreign key (cust_id) references cust(cust_id),
  foreign key (cust_addr_country) references jsharmony_code_country(code_val),
  foreign key (cust_addr_country, cust_addr_state) references jsharmony_code2_country_state(code_val1, code_val2)
);
insert into cust_addr(cust_id,cust_addr_line1,cust_addr_city,cust_addr_state,cust_addr_zip,cust_addr_country,cust_addr_type) values (1,'123 Test St','Chicago','IL','60103','USA','BILLING');
insert into cust_addr(cust_id,cust_addr_line1,cust_addr_city,cust_addr_state,cust_addr_zip,cust_addr_country,cust_addr_type) values (1,'234 Main St','Chicago','IL','60103','USA','SHIPPING');
insert into cust_addr(cust_id,cust_addr_line1,cust_addr_city,cust_addr_state,cust_addr_zip,cust_addr_country,cust_addr_type) values (2,'111 S State St','Chicago','IL','60103','USA','BILLING');

/*********cust_contact*********/
create table cust_contact (
  cust_contact_id integer primary key autoincrement not null,
  cust_id integer not null,
  cust_contact_name text not null,
  cust_contact_title text,
  cust_contact_phone text,
  cust_contact_email text,
  cust_addr_id_shipping integer null,
  cust_addr_id_billing integer null,
  unique(cust_id,cust_contact_name),
  foreign key (cust_id) references cust(cust_id),
  foreign key (cust_addr_id_shipping) references cust_addr(cust_addr_id),
  foreign key (cust_addr_id_billing) references cust_addr(cust_addr_id)
);
insert into cust_contact(cust_id,cust_contact_name,cust_contact_title) values (1,'John Smith','General Manager');
insert into cust_contact(cust_id,cust_contact_name,cust_contact_title) values (1,'Jessie Blane','CFO');
insert into cust_contact(cust_id,cust_contact_name,cust_contact_title) values (2,'Jason Gant','Engineering Manager');

/*********cust_flag*********/
create table cust_flag (
  cust_flag_id integer primary key autoincrement not null,
  cust_id integer not null,
  cust_flag_type text not null,
  unique(cust_id,cust_flag_type),
  foreign key (cust_id) references cust(cust_id),
  foreign key (cust_flag_type) references code_cust_flag_type(code_val)
);
insert into cust_flag(cust_id,cust_flag_type) values (1,'PREF');
insert into cust_flag(cust_id,cust_flag_type) values (1,'PAPER');
insert into cust_flag(cust_id,cust_flag_type) values (1,'DEDIREP');
insert into cust_flag(cust_id,cust_flag_type) values (2,'CRDTRISK');

/*********item*********/
create table item (
  item_id integer primary key autoincrement not null,
  cust_id integer not null,
  item_code text not null,
  item_name text not null,
  unique(cust_id,item_code),
  foreign key (cust_id) references cust(cust_id)
);
insert into item(cust_id,item_code,item_name) values (1,'A392','Maier C6');
insert into item(cust_id,item_code,item_name) values (1,'A214','Maier ML-26');
insert into item(cust_id,item_code,item_name) values (2,'515-231','Milwaukee Portable Drill Press');

/*********v_cust*********/
create view v_cust as
  select cust_id,cust_sts,cust_name,code_cust_sts.code_txt as cust_sts_txt,cust_einhash
    from cust
    left outer join code_cust_sts on cust.cust_sts = code_cust_sts.code_val;

/*********v_cust_contact*********/
create view v_cust_contact as
  select cust_contact_id,cust_contact_name,cust_contact_title,cust_contact_phone,cust_contact_email,cust_contact.cust_id,cust_name
    from cust_contact
    inner join cust on cust.cust_id=cust_contact.cust_id;

/********category*********/
create table category (
  category_id integer primary key autoincrement not null,
  category_parent_id integer,
  category_name text,
  foreign key (category_parent_id) references category(category_id)
);
insert into category(category_id, category_parent_id, category_name) values(1, null,'(Root)');
insert into category(category_id, category_parent_id, category_name) values(2, 1,'Home');
insert into category(category_id, category_parent_id, category_name) values(4, 2,'Cooking');
insert into category(category_id, category_parent_id, category_name) values(5, 2,'Design Ideas');
insert into category(category_id, category_parent_id, category_name) values(3, 5,'Bath');
insert into category(category_id, category_parent_id, category_name) values(6, 5,'Kitchen');
insert into category(category_id, category_parent_id, category_name) values(7, 5,'Inspiration Photos');
insert into category(category_id, category_parent_id, category_name) values(8, 4,'Baking');
insert into category(category_id, category_parent_id, category_name) values(9, 4,'Vegan');

/*********all_types*********/
create table all_types (
  x_primary integer primary key autoincrement not null,
  x_boolean integer,
  x_bigint integer,
  x_integer integer,
  x_smallint integer,
  x_tinyint integer,
  x_decimal real,
  x_float real,
  x_date text,
  x_datetime text,
  x_time text,
  x_varchar text,
  x_varcharmax text,
  x_char text,
  x_binary blob,
  x_encascii blob,
  x_hash blob
);
insert into all_types(
    x_boolean,
    x_bigint,x_integer,x_smallint,x_tinyint,x_decimal,x_float,
    x_date,x_datetime,x_time,
    x_varchar,x_varcharmax,x_char,
    x_binary) 
  values (
  '1',
  20999999999,
  199999999,
  30999,
  254,
  999999.123456789,
  2.12345678901234e50,
  '1999-09-09',
  '1999-09-09 09:59:59.987654',
  '16:32:12.987654',
  '▶▶▶▶▶abcdefgABCDEFG',
  '▶▶▶▶▶MAX01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789END', 
  '▶▶▶▶▶abcdefABCDEF',
  X'123456789A'
);
insert into all_types(
    x_boolean,
    x_bigint,x_integer,x_smallint,x_tinyint,x_decimal,x_float,
    x_date,x_datetime,x_time,
    x_varchar,x_varcharmax,x_char,
    x_binary) 
  values (
  '0',
  1,
  1,
  1,
  1,
  1,
  1,
  '1999-09-09',
  '1999-09-09 09:59:59.987654',
  '16:32:12.987654',
  'Test1',
  'Test2', 
  'Test3',
  X'001100'
);
insert into all_types(
    x_boolean,
    x_bigint,x_integer,x_smallint,x_tinyint,x_decimal,x_float,
    x_date,x_datetime,x_time,
    x_varchar,x_varcharmax,x_char,
    x_binary) 
  values (
  '0',
  2,
  2,
  2,
  2,
  2,
  2,
  '1999-09-09',
  '1999-09-09 09:59:59.987654',
  '16:32:12.987654',
  'Test1',
  'Test2', 
  'Test3',
  X'001100'
);

/*********all_controls*********/
create table all_controls (
  x_primary integer primary key autoincrement not null,
  x_label text,
  x_html text,
  x_textbox text,
  x_textzoom text,
  x_dropdown text,
  x_date text,
  x_textarea text,
  x_hidden text,
  x_checkbox integer,
  x_password text,
  x_error text,
  x_customtextbox text,
  x_customdropdown text
);

create trigger all_controls_before_insert before insert on all_controls
begin
  select case when (NEW.x_error is not null) and (NEW.x_error = 'application_error') then raise(FAIL,'Application Error - Sample Application Error') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'application_warning') then raise(FAIL,'Application Warning - Sample Application Warning') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'execute_form') then raise(FAIL,'Execute Form - Sample Execute Form Message //<%=xmodel.namespace%>ModelDBValidation_ErrorPopup?action=update&x_primary=1&x_error_value=<%=xmodel.get("x_error")%>') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'db_error_standard') then raise(FAIL,'sample_db_error_standard') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'db_error_regex') then raise(FAIL,'sample_db_error_regex') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'unhandled') then raise(FAIL,'Sample unhandled database error') end\;
  select case when (NEW.x_error is not null) then raise(FAIL,'Application Error - Invalid value for x_error') end\;
end;

create trigger all_controls_before_update before update on all_controls
begin
  select case when (NEW.x_error is not null) and (NEW.x_error = 'application_error') then raise(FAIL,'Application Error - Sample Application Error') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'application_warning') then raise(FAIL,'Application Warning - Sample Application Warning') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'execute_form') then raise(FAIL,'Execute Form - Sample Execute Form Message //<%=xmodel.namespace%>ModelDBValidation_ErrorPopup?action=update&x_primary=<%=xmodel.get("x_primary")%>&x_error_value=<%=xmodel.get("x_error")%>') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'db_error_standard') then raise(FAIL,'sample_db_error_standard') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'db_error_regex') then raise(FAIL,'sample_db_error_regex') end\;
  select case when (NEW.x_error is not null) and (NEW.x_error = 'unhandled') then raise(FAIL,'Sample unhandled database error') end\;
  select case when (NEW.x_error is not null) then raise(FAIL,'Application Error - Invalid value for x_error') end\;
end;

insert into all_controls(x_label, x_html, x_textbox, x_textzoom, x_dropdown, x_date, x_textarea, x_hidden, x_checkbox, x_password, x_customtextbox, x_customdropdown)
values (
  'Test Label',
  '<b>Test</b> HTML',
  'Test Textbox',
  'Test Textzoom
Test Line 2
Test Line 3',
  'VALUE1',
  '2019-01-19',
  'Test Textarea
Test Line 2
Test Line 3
Test Line 4
Test Line 5',
  'Test Hidden Field',
  '1',
  'Test Password',
  'Custom Textbox',
  'ONE'
);
insert into all_controls(x_label, x_html, x_textbox, x_textzoom, x_dropdown, x_date, x_textarea, x_hidden, x_checkbox, x_password)
values (
  'Test Label',
  '<b>Test</b> HTML',
  'Textbox Second Row',
  'Test Textzoom
Test Line 2
Test Line 3',
  'VALUE1',
  '2019-01-19',
  'Test Textarea
Test Line 2
Test Line 3',
  'Test Hidden Field',
  '0',
  'Test Password'
);
insert into all_controls(x_label) values ('Third row');


insert into jsharmony.sys_user(sys_user_id,sys_user_fname,sys_user_lname,sys_user_email,sys_user_startdt,sys_user_pw1,sys_user_pw2)
  select 1, 'Admin', 'User', 'admin@jsharmony.com', datetime('now','localtime'),'******','******'
  where not exists(select * from jsharmony.sys_user where sys_user_id=1);

insert into jsharmony.help_target(help_target_code, help_target_desc)
  select 'ModelHelp_Cust_Listing', 'Help Example - Cust_Listing'
  where not exists(select * from jsharmony.help_target where help_target_code = 'ModelHelp_Cust_Listing');

insert into jsharmony.help(help_target_code, help_title, help_text, help_listing_main, help_listing_client)
  select 'ModelHelp_Cust_Listing', 'Customer Listing', '<p><strong>Sample</strong> Help Content</p><p>&nbsp\;</p>', 1, 1
  where not exists(select * from jsharmony.help where help_target_code = 'ModelHelp_Cust_Listing');

/*********scope codes*********/
update jsharmony.code_doc_scope set code_code='cust' where code_val='C';
update jsharmony.code_note_scope set code_code='cust' where code_val='C';


end;