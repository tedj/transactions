FROM node:boron

RUN mkdir -p /balances
WORKDIR /balances
COPY package.json /balances/
RUN npm i

COPY src/ /balances/src/

EXPOSE 8080
CMD npm start