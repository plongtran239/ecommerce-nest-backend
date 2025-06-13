# Stage 1: Development with devDependencies
FROM node:22.15-alpine3.20 as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Final lightweight image
FROM node:22.15-alpine3.20

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./

EXPOSE 4000
CMD ["node", "dist/src/main"]