-- register core identity
insert into users (id, email, username)
values (
  '019efebb-57f8-7938-91fa-e19cd9851a89',
  'boz.amico@allfreemail.net',
  'bozamico'
)
on conflict on constraint users_username_key do nothing;


-- add user profile
insert into user_profiles (user_id, avatar_url)
values (
  '019efebb-57f8-7938-91fa-e19cd9851a89',
  'api.dicebear.com/10.x/thumbs/svg?seed=7twoyyyc'
)
on conflict on constraint user_profiles_user_id_key do nothing;