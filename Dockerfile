FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production &&\
    npm install typescript -g

COPY . .

EXPOSE 8080
CMD [ "npm", "run", "prod" ]
