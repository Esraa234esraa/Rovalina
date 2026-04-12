FROM node:20-alpine

WORKDIR /app/backend

# Copy backend project files needed for runtime
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma/
COPY backend/scripts ./scripts/
COPY backend/src ./src/

# Install dependencies (includes dev deps required by tsx/prisma scripts)
RUN npm ci

# Generate Prisma client at build time
RUN npm run prisma:generate

EXPOSE 5000

# Use the existing Railway startup flow (db prepare + migrate + start)
CMD ["npm", "run", "start:railway"]
