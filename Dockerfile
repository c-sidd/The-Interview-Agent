# ==============================================================================
# AI Interview Agent — Docker Configuration (Dockerfile)
# ==============================================================================

# 1. Base Image
FROM node:20-alpine

# 2. Set Working Directory
WORKDIR /usr/src/app

# 3. Install Dependencies
# Copy package files first to leverage Docker build cache layers
COPY package*.json ./
RUN npm ci --only=production

# 4. Copy Application Source Code
COPY . .

# 5. Environment Defaults
ENV NODE_ENV=production
ENV PORT=3000

# 6. Expose Service Port
EXPOSE 3000

# 7. Start Command
CMD ["node", "server.js"]
