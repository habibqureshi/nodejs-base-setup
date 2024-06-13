FROM node:16-alpine

EXPOSE 8000

WORKDIR /app

COPY package.json ./

COPY . .

RUN npm i

CMD ["node","./bin/www"]