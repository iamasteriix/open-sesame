drop index if exists public.oauth_user_consents_client_id_idx;
drop index if exists public.oauth_user_consents_user_id_idx;
drop table if exists public.oauth_user_consents;

drop index if exists public.oauth_clients_client_id_idx;
drop table if exists public.oauth_clients;

drop index if exists public.user_credentials_user_id_idx;
drop table if exists public.user_credentials;

drop index if exists public.user_device_activity_active_device_idx;
drop index if exists public.user_device_activity_token_id_idx;
drop index if exists public.user_devices_device_id_idx;
drop index if exists public.user_devices_user_id_idx;
drop table if exists public.user_device_activity_default;
drop table if exists public.user_device_activity_2026;
drop table if exists public.user_device_activity;
drop table if exists public.user_devices;
drop table if exists public.devices;

drop index if exists public.users_roles_role_id_idx;
drop index if exists public.users_roles_user_id_idx;
drop index if exists public.users_deleted_at_idx;
drop table if exists public.users_roles;
drop table if exists public.roles;
drop table if exists public.users;
