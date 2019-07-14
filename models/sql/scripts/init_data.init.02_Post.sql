/*********create user*********/
insert into jsharmony.cust_user(cust_id,sys_user_fname,sys_user_lname,sys_user_email,sys_user_pw1,sys_user_pw2)
  select 1, 'John', 'Johnson', 'john@acme.com','12345678','12345678'
  where not exists(select * from jsharmony.cust_user where sys_user_id=1);

insert into jsharmony.cust_user_role(sys_user_id, cust_role_name) values (1, 'CX_B');
insert into jsharmony.cust_user_role(sys_user_id, cust_role_name) values (1, 'CX_X');
insert into jsharmony.cust_user_role(sys_user_id, cust_role_name) values (1, 'CSYSADMIN');

/*********add sample note*********/
insert into jsharmony_note(note_scope,note_scope_id,note_type,note_body) values ('C',1,'S','Test Note');

/*********initialize agreement*********/
update jsharmony.txt set txt_body='<p><strong>Sample Agreement</strong></p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec placerat condimentum eros, viverra finibus ligula consequat non. Etiam tincidunt dictum lectus id interdum</p>' where txt_process='CMS' and txt_attrib='Client/Agreement';