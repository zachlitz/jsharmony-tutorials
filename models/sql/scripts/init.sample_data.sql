/*********create user*********/
delete from jsharmony.cust_user_role;
delete from jsharmony.cust_user;
delete from jsharmony.note;
delete from jsharmony.help_target;
delete from jsharmony.help;

insert into jsharmony.cust_user(cust_id,sys_user_fname,sys_user_lname,sys_user_email,sys_user_pw1,sys_user_pw2)
  select 1, 'John', 'Johnson', 'john@acme.com','12345678','12345678'
  where not exists(select * from jsharmony.cust_user);

insert into jsharmony.cust_user_role(sys_user_id, cust_role_name) values ((select sys_user_id from jsharmony.cust_user limit 1), 'CX_B');
insert into jsharmony.cust_user_role(sys_user_id, cust_role_name) values ((select sys_user_id from jsharmony.cust_user limit 1), 'CX_X');
insert into jsharmony.cust_user_role(sys_user_id, cust_role_name) values ((select sys_user_id from jsharmony.cust_user limit 1), 'CSYSADMIN');
insert into jsharmony.cust_user_role(sys_user_id, cust_role_name) values ((select sys_user_id from jsharmony.cust_user limit 1), 'CUSER');

/*********add sample note*********/
insert into jsharmony_note(note_scope,note_scope_id,note_type,note_body) values ('C',1,'S','Test Note');

/*********initialize agreement*********/
update jsharmony.txt set txt_body='<p><strong>Sample Agreement</strong></p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec placerat condimentum eros, viverra finibus ligula consequat non. Etiam tincidunt dictum lectus id interdum</p>' where txt_process='CMS' and txt_attrib='Client/Agreement';

/*********init user*********/
insert into jsharmony.sys_user(sys_user_id,sys_user_fname,sys_user_lname,sys_user_email,sys_user_startdt,sys_user_pw1,sys_user_pw2)
  select 1, 'Admin', 'User', 'admin@jsharmony.com', datetime('now','localtime'),'******','******'
  where not exists(select * from jsharmony.sys_user where sys_user_id=1);

/*********sample help data*********/
insert into jsharmony.help_target(help_target_code, help_target_desc)
  select 'ModelHelp_Cust_Listing', 'Help Example - Cust_Listing'
  where not exists(select * from jsharmony.help_target where help_target_code = 'ModelHelp_Cust_Listing');

insert into jsharmony.help(help_id, help_target_code, help_title, help_text, help_listing_main, help_listing_client)
  select 1, 'ModelHelp_Cust_Listing', 'Customer Listing', '<p><strong>Sample</strong> Help Content</p><p>&nbsp\;</p>', 1, 1
  where not exists(select * from jsharmony.help where (help_target_code = 'ModelHelp_Cust_Listing') or (help_id = 1));
