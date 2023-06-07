# syntax=docker/dockerfile:1

FROM node:lts
WORKDIR /app
COPY . /app
RUN npm install
CMD ["node", "index.js"]
EXPOSE 3306