FROM node:24-alpine
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps ./apps
COPY packages ./packages
COPY services ./services
COPY schema ./schema
COPY tsconfig.base.json ./
RUN npm ci && npm run wasm:build
RUN npm run build -w @inventory/web && npm run build -w @inventory/products
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@inventory/web"]
