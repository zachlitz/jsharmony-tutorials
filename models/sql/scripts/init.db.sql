pragma foreign_keys = ON;

begin;

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
  c_ein blob,
  c_einhash blob,
  c_doc_ext text,
  c_doc_size integer,
  c_doc_utstmp text,
  c_doc_uu text,
  c_desc text,
  c_start_dt text,
  c_overdue_amt text,
  c_entry_user text,
  c_entry_tstmp text,
  c_update_dt text,
  foreign key (c_sts) references ucod_c_sts(codeval)
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
insert into c(c_id,c_sts,c_name,c_desc,c_start_dt,c_overdue_amt) values (1,'DEACTIVE','ACME Industries','Industrial Fixtures',date('now', 'localtime'),'1234567.12');
insert into c(c_id,c_sts,c_name,c_desc,c_start_dt,c_overdue_amt) values (2,'ACTIVE','Creative Engineering','',date('now', 'localtime'),'0');
insert into c(c_id,c_sts,c_name,c_desc,c_start_dt,c_overdue_amt) values (3,'ACTIVE','Coffee Brothers','',null,'90.9');

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