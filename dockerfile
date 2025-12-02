FROM node:18-alpine

RUN apk add --no-cache python3 make g++ gcc musl-dev

WORKDIR /app

COPY package*.json ./

RUN rm -rf package-lock.json node_modules && npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]