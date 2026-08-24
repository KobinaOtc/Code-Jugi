# ==========================================
# STAGE 1: The Builder (Compiles TypeScript)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including dev tools like TypeScript)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript into JavaScript (outputs to /dist)
RUN npm run build

# ==========================================
# STAGE 2: The Production Runner
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the compiled JavaScript from Stage 1
COPY --from=builder /app/dist ./dist

# Expose the port Express runs on
EXPOSE 5001

# Start the application
CMD ["npm", "start"]