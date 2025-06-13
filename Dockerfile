FROM node:22.15-alpine3.20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:22.15-alpine3.20

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy app output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["npm", "run", "start:prod"]