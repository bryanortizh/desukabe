FROM node:18-alpine

RUN apk add --no-cache python3 make g++ gcc musl-dev

RUN npm install -g node-gyp

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]