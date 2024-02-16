FROM node:16

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
# RUN yarn --production
RUN yarn
COPY . .

RUN yarn build

COPY ./static/ ./dist/static/
# COPY ./admin-ui/ ./dist/src/admin-ui/