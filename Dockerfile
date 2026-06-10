FROM node:24-slim AS development

WORKDIR /app

COPY package*.json .nvmrc   ./
COPY apps/web/package*.json ./apps/web/

RUN npm i

COPY apps/web ./apps/web/

EXPOSE 3000