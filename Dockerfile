# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Uses the production configuration, which swaps in environment.prod.ts.
RUN npm run build -- --configuration production

# Run stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist/Backlogr/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
# nginx:alpine expands ${PORT} in templates/ at startup.
ENV PORT=80
EXPOSE 80
