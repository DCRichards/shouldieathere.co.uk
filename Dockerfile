FROM node:24-alpine

RUN apk update && apk add git

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

CMD ["yarn", "serve"]
