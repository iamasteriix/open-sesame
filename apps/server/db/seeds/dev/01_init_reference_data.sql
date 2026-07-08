-- operating roles
do $$
declare
  role_record record;
begin
  for role_record in
    values
      (
        'super-admin', 
        'Super Admin', 
        'Full system access with complete organizational authority.', 
        '{"users": ["create", "delete", "invite_members"], "billing": ["manage_billing"], "content": ["edit_content"], "reports": ["view_reports"]}'::jsonb
      ),
      (
        'admin', 
        'Admin', 
        'Administrative access to manage content and users, excluding billing authority.', 
        '{"users": ["create", "invite_members"], "content": ["edit_content"], "reports": ["view_reports"]}'::jsonb
      ),
      (
        'user', 
        'Regular User', 
        'Standard consumer account with read-only views and basic content tools.', 
        '{"content": ["edit_content"]}'::jsonb
      )
  loop
    insert into roles (slug, name, description, permissions)
    values (role_record.column1, role_record.column2, role_record.column3, role_record.column4)
    on conflict on constraint roles_slug_key do nothing;
  end loop;
end $$
language plpgsql;