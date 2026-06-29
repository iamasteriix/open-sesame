create extension if not exists pg_cron;


-- register (or update) a scheduled job with pg_cron using a named task
select cron.schedule (
  'cleanup-expired-oidc-models',  -- job name: identifies this cron task in pg_cron
  '0 * * * *',                    -- cron expression: run at minute 0 of every hour
  $$
    delete
    from oidc_models
    where expires_at < now()
  $$
);