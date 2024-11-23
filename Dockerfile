FROM node:20-alpine3.20 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Production build
FROM node:20-alpine3.20
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/package* ./
RUN npm install --omit=dev
CMD ["node", "lib/index.js"]