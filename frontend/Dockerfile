FROM node:20-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine as prod
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"] 