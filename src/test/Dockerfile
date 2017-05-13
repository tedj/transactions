FROM node:boron

RUN mkdir -p /tester

WORKDIR /tester
COPY package.json /tester/
RUN npm i

COPY transfer.js /tester/

CMD npm test