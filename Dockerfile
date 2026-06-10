FROM node:24-slim AS development

WORKDIR /app

COPY package*.json .nvmrc       ./
COPY apps/web/package*.json     ./apps/web/
COPY apps/server/package*.json  ./apps/server/

RUN npm i

COPY apps/web/     ./apps/web/
COPY apps/server/  ./apps/server/

EXPOSE 3000 5000