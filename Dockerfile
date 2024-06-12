FROM node:18-alpine


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install pm2@latest -g

RUN npm install

COPY . .

EXPOSE 80

CMD ["pm2-runtime", "ecosystem.config.js"]
