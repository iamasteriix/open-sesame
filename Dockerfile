# base app ————————————————————————————————————————————————————————————————————
FROM node:24-slim AS development

WORKDIR /app

COPY package*.json .nvmrc       ./
COPY apps/web/package*.json     ./apps/web/
COPY apps/server/package*.json  ./apps/server/

RUN npm i

COPY apps/web/     ./apps/web/
COPY apps/server/  ./apps/server/

EXPOSE 3000 5000


# postgres ————————————————————————————————————————————————————————————————————
FROM postgres:18 AS postgres

RUN apt update \
    && apt install -y postgresql-18-cron \
    && rm -rf /var/lib/apt/lists/*
