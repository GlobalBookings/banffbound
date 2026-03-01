FROM node:20-alpine

WORKDIR /app

COPY agents/package.json agents/package-lock.json ./
RUN npm ci --production

COPY agents/src/ ./src/

EXPOSE 3100

CMD ["node", "src/index.js"]
