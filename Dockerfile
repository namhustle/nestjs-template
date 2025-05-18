# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package files to leverage Docker cache
COPY package*.json ./

# Install dependencies without running lifecycle scripts
RUN npm ci --ignore-scripts

# Copy the rest of the application source code
COPY . .

# Build the application (compile TypeScript to JavaScript)
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only necessary files for production
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts

# Copy compiled source from the builder stage
COPY --from=builder /app/dist ./dist

# Start the application
CMD ["node", "dist/main"]