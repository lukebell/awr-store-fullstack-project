# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=src/modules/prisma/schema.prisma

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/common/generated ./src/common/generated
COPY --from=builder /app/src/modules/prisma/schema.prisma ./src/modules/prisma/schema.prisma
COPY --from=builder /app/src/modules/prisma/migrations ./src/modules/prisma/migrations

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main"]
