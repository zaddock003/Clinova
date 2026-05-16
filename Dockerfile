FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json vite.config.ts ./
COPY server ./server
COPY public ./public
COPY src ./src
COPY index.html dashboard.html ./

RUN npm install
RUN npm run build

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["npx", "tsx", "server/index.ts"]
