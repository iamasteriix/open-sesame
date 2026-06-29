select cron.unschedule ('cleanup-expired-oidc-models');


drop extension if exists pg_cron;