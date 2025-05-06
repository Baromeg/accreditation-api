# Use official Node base image
FROM node:20-alpine

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy lock and manifest files
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Build the app
CMD ["pnpm", "start:dev"]

