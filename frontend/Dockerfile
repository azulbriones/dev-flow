FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@11.0.8 --activate && CI=true pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
