FROM node:20-alpine AS builder
# Add a work directory
WORKDIR /app
RUN apk add --update --no-cache \
    git
# Cache and Install dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install
# Copy app files
COPY . .
# Build the app
ARG env=dev
ARG client=swizi
RUN npx dotenv-cli -c -e .env -e env/${client}/.env.${env} -e .env.swizi.${env} vite build

# Bundle static assets with nginx
FROM nginx:1-alpine AS production
# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html
# Add your nginx.conf
COPY docker/nginx.conf /etc/nginx/templates/nginx.conf.template
# Expose port
ENV NGINX_PORT=80
EXPOSE $NGINX_PORT
# Start nginx
CMD ["nginx", "-g", "daemon off;"]