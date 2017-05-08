FROM node:boron

WORKDIR /usr/src/app
COPY ./ ./
RUN npm i

EXPOSE 8080
CMD npm start