pragma foreign_keys = ON;

begin;

drop table if exists allcontrols;
drop table if exists alltypes;
drop view if exists v_cc;
drop view if exists v_c;
drop table if exists e;
drop table if exists cf;
drop table if exists cc;
drop table if exists ca;
drop table if exists c_ext;
drop table if exists c;
drop table if exists ucod_cf_type;
drop table if exists ucod_c_sts;
drop table if exists sdx;

/*********SDX*********/
create table sdx (
  sdx_id integer primary key autoincrement not null,
  table_name text not null,
  field_name text not null,
  table_id text not null,
  sdx_word text not null,
  sdx_val text not null
);

/*********UCOD_STS*********/
create_ucod('ucod_c_sts');
INSERT INTO jsharmony_ucod_h (codename, codemean) VALUES ('c_sts', 'Customer Status');
insert into ucod_c_sts(codseq,codeval,codetxt,codecode) values (2,'ACTIVE','Active','A');
insert into ucod_c_sts(codseq,codeval,codetxt,codecode) values (6,'CLOSED','Closed','C');
insert into ucod_c_sts(codseq,codeval,codetxt,codecode) values (4,'CREDITH','Credit Hold','A');
insert into ucod_c_sts(codseq,codeval,codetxt,codecode) values (5,'HOLD','Hold','C');
insert into ucod_c_sts(codseq,codeval,codetxt,codecode) values (3,'INACTIVE','Inactive','A');
insert into ucod_c_sts(codseq,codeval,codetxt,codecode,codetdt) values (1,'DEACTIVE','Deactivated','A','2017-11-19');

/*********UCOD_CF_TYPE*********/
create_ucod('ucod_cf_type');
INSERT INTO jsharmony_ucod_h (codename, codemean) VALUES ('cf_type', 'Customer Flag Type');
insert into ucod_cf_type(codseq,codeval,codetxt) values (1,'PREF','Preferred');
insert into ucod_cf_type(codseq,codeval,codetxt) values (2,'CRDTRISK','Credit Risk');
insert into ucod_cf_type(codseq,codeval,codetxt) values (3,'PAPER','Paper-only');
insert into ucod_cf_type(codseq,codeval,codetxt,codetdt) values (4,'DEDIREP','Dedicated Rep','2017-11-19' );

/*********C*********/
create table c (
  c_id integer primary key autoincrement not null,
  c_sts text not null default 'ACTIVE',
  c_name text not null unique,
  c_email text,
  c_ein blob,
  c_einhash blob,
  c_doc_ext text,
  c_doc_size integer,
  c_doc_utstmp text,
  c_doc_uu text,
  c_desc text,
  c_portal_welcome text,
  c_start_dt text,
  c_overdue_amt text,
  c_parent_id integer null,
  c_entry_user text,
  c_entry_tstmp text,
  c_update_dt text,
  foreign key (c_sts) references ucod_c_sts(codeval),
  foreign key (c_parent_id) references c(c_id)
);
create trigger c_after_insert after insert on c
begin
  update c set 
    c_entry_user  = (select context from jsharmony_meta limit 1),
    c_entry_tstmp = datetime('now','localtime')
    where rowid = new.rowid\;
  delete from sdx where table_name='c' and table_id=NEW.c_id\;
  update jsharmony_meta set jsexec = '{ "function": "soundex", "source": "(select c_name from c where c_id='||NEW.c_id||')", "dest": "insert into sdx(table_name,field_name,table_id,sdx_word,sdx_val) values(''c'',''c_name'','||NEW.c_id||',(select c_name from c where c_id='||NEW.c_id||'),%%%SOUNDEX%%%)" }'\;
end;
create trigger c_after_update after update on c
begin
  delete from sdx where table_name='c' and table_id=OLD.c_id\;
  update jsharmony_meta set jsexec = '{ "function": "soundex", "source": "(select c_name from c where c_id='||NEW.c_id||')", "dest": "insert into sdx(table_name,field_name,table_id,sdx_word,sdx_val) values(''c'',''c_name'','||NEW.c_id||',(select c_name from c where c_id='||NEW.c_id||'),%%%SOUNDEX%%%)" }'\;
end;
insert into c(c_id,c_sts,c_name,c_desc,c_start_dt,c_overdue_amt,c_email,c_portal_welcome,c_doc_ext,c_doc_size,c_doc_utstmp,c_doc_uu) values (1,'DEACTIVE','ACME Industries','Industrial Fixtures',date('now', 'localtime'),'1234567.12','user@example.com','<b>Sample</b> HTML<br/><img src="data:image/png\;base64,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">','.jpg',14434,datetime('now', 'localtime'),'system');
insert into c(c_id,c_sts,c_name,c_desc,c_start_dt,c_overdue_amt,c_parent_id) values (2,'ACTIVE','Creative Engineering','',date('now', 'localtime'),'0',1);
insert into c(c_id,c_sts,c_name,c_desc,c_start_dt,c_overdue_amt,c_doc_ext,c_doc_size,c_doc_utstmp,c_doc_uu) values (3,'ACTIVE','Coffee Brothers','',null,'90.9','.jpg',521480,datetime('now', 'localtime'),'system');

/*********c_ext*********/
create table c_ext (
  c_id integer primary key not null,
  c_ext_desc text null,
  foreign key (c_id) references c(c_id)
);
insert into c_ext(c_id,c_ext_desc) values (1,'Extended Description');


/*********ca*********/
create table ca (
  ca_id integer primary key autoincrement not null,
  c_id integer not null,
  ca_addr1 text null,
  ca_addr2 text null,
  ca_city text not null,
  ca_state text not null,
  ca_zip text null,
  ca_country text not null,
  ca_type text null,
  foreign key (c_id) references c(c_id),
  foreign key (ca_country) references jsharmony_ucod_country(codeval),
  foreign key (ca_country, ca_state) references jsharmony_ucod2_country_state(codeval1, codeval2)
);
insert into ca(c_id,ca_addr1,ca_city,ca_state,ca_zip,ca_country,ca_type) values (1,'123 Test St','Chicago','IL','60103','USA','BILLING');
insert into ca(c_id,ca_addr1,ca_city,ca_state,ca_zip,ca_country,ca_type) values (1,'234 Main St','Chicago','IL','60103','USA','SHIPPING');
insert into ca(c_id,ca_addr1,ca_city,ca_state,ca_zip,ca_country,ca_type) values (2,'111 S State St','Chicago','IL','60103','USA','BILLING');

/*********CC*********/
create table cc (
  cc_id integer primary key autoincrement not null,
  c_id integer not null,
  cc_name text not null,
  cc_title text,
  cc_phone text,
  cc_email text,
  ca_id_shipping integer null,
  ca_id_billing integer null,
  unique(c_id,cc_name),
  foreign key (c_id) references c(c_id),
  foreign key (ca_id_shipping) references ca(ca_id),
  foreign key (ca_id_billing) references ca(ca_id)
);
insert into cc(c_id,cc_name,cc_title) values (1,'John Smith','General Manager');
insert into cc(c_id,cc_name,cc_title) values (1,'Jessie Blane','CFO');
insert into cc(c_id,cc_name,cc_title) values (2,'Jason Gant','Engineering Manager');

/*********CF*********/
create table cf (
  cf_id integer primary key autoincrement not null,
  c_id integer not null,
  cf_type text not null,
  unique(c_id,cf_type),
  foreign key (c_id) references c(c_id),
  foreign key (cf_type) references ucod_cf_type(codeval)
);
insert into cf(c_id,cf_type) values (1,'PREF');
insert into cf(c_id,cf_type) values (1,'PAPER');
insert into cf(c_id,cf_type) values (1,'DEDIREP');
insert into cf(c_id,cf_type) values (2,'CRDTRISK');

/*********E*********/
create table e (
  e_id integer primary key autoincrement not null,
  c_id integer not null,
  e_k text not null,
  e_name text not null,
  unique(c_id,e_k),
  foreign key (c_id) references c(c_id)
);
insert into e(c_id,e_k,e_name) values (1,'A392','Maier C6');
insert into e(c_id,e_k,e_name) values (1,'A214','Maier ML-26');
insert into e(c_id,e_k,e_name) values (2,'515-231','Milwaukee Portable Drill Press');

/*********V_C*********/
create view v_c as
  select c_id,c_sts,c_name,ucod_c_sts.codetxt as c_sts_txt,c_einhash
    from c
    left outer join ucod_c_sts on c.c_sts = ucod_c_sts.codeval;

/*********V_C*********/
create view v_cc as
  select cc_id,cc_name,cc_title,cc_phone,cc_email,cc.c_id,c_name
    from cc
    inner join c on c.c_id=cc.c_id;
    
/*********ALLTYPES*********/
create table alltypes (
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
insert into alltypes(
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
insert into alltypes(
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
insert into alltypes(
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

/*********ALLCONTROLS*********/
create table allcontrols (
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
  x_password text
);
insert into allcontrols(x_label, x_html, x_textbox, x_textzoom, x_dropdown, x_date, x_textarea, x_hidden, x_checkbox, x_password)
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
  'Test Password'
);
insert into allcontrols(x_label, x_html, x_textbox, x_textzoom, x_dropdown, x_date, x_textarea, x_hidden, x_checkbox, x_password)
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


insert into jsharmony.pe(pe_id,pe_fname,pe_lname,pe_email,pe_startdt,pe_pw1,pe_pw2)
  select 1, 'Admin', 'User', 'admin@jsharmony.com', datetime('now','localtime'),'******','******'
  where not exists(select * from jsharmony.pe where pe_id=1);

insert into jsharmony.hp(hp_code, hp_desc)
  select 'ModelHelp_CL', 'Help Example - CL'
  where not exists(select * from jsharmony.hp where hp_code = 'ModelHelp_CL');

insert into jsharmony.h(hp_code, h_title, h_text, h_index_a, h_index_p)
  select 'ModelHelp_CL', 'Customer Listing', '<p><strong>Sample</strong> Help Content</p><p>&nbsp\;</p>', 1, 1
  where not exists(select * from jsharmony.h where hp_code = 'ModelHelp_CL');

end;