FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

# Copy root package files and install core dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy server package files
COPY server/package.json server/
# Server uses root node_modules (playwright, chalk) so no separate install needed

# Copy source and data
COPY src/ src/
COPY data/ data/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build:core

# Copy server entry point
COPY server/index.js server/

WORKDIR /app/server

EXPOSE 3002

CMD ["node", "index.js"]
