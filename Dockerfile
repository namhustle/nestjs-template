FROM node:20-alpine AS build-stage

WORKDIR /template_api

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS prod-stage

COPY --from=build-stage /template_api/dist /template_api/dist
COPY --from=build-stage /template_api/package.json /template_api/package.json

WORKDIR /template_api

RUN npm install --production

CMD ["npm", "run", "start:prod"]