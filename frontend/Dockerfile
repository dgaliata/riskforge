# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Serve stage
FROM nginx:1.31-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY entrypoint.sh /entrypoint.sh

RUN apk add --no-cache libcap && \
    chmod +x /entrypoint.sh && \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html /etc/nginx/conf.d

USER nginx

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]