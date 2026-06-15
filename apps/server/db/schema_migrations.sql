-- ensure public schema exists
create schema if not exists public;


-- create schema to organize migration-related objects
create schema if not exists migrations;


-- migration tracking table stores the history of all applied migrations
create table
  if not exists migrations.schema_migrations (
  id serial primary key,
  version varchar(14) not null unique,          -- timestamp-based version
  name varchar(255) not null,                   -- human-readable migration name
  checksum varchar(64) not null,                -- sha256 hash of migration content
  applied_at timestamptz default now(),
  applied_by varchar(100) default current_user,
  execution_time_ms integer,                    -- track how long migrations take
  rolled_back_at timestamptz                    -- null if not rolled back
);


-- index for quick version lookups during migration runs
create index
  if not exists migrations_version_idx
  on migrations.schema_migrations (version);


-- index for active (non-rolled back) migrations
create index
  if not exists migrations_active_idx
  on migrations.schema_migrations (version)
  where rolled_back_at is null;