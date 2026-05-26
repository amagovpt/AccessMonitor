FROM node:20-alpine AS base 

WORKDIR /app


COPY package*.json ./

COPY . .
RUN npm ci

FROM base AS development
COPY --from=base /app/node_modules ./node_modules

COPY . .

ARG REACT_APP_BASE_URL
ARG REACT_APP_AMP_SERVER
ARG REACT_APP_API_DATA_SOURCE
ARG REACT_APP_SERVER_URL

ENV REACT_APP_SERVER_URL=$REACT_APP_SERVER_URL
ENV REACT_APP_API_DATA_SOURCE=$REACT_APP_API_DATA_SOURCE
ENV REACT_APP_BASE_URL=$REACT_APP_BASE_URL
ENV REACT_APP_AMP_SERVER=$REACT_APP_AMP_SERVER
    
EXPOSE 3000
CMD [ "npm", "run", "start:noenv" ]

FROM  base AS builder
WORKDIR /app
COPY .htaccess ./
ARG REACT_APP_BASE_URL
ARG REACT_APP_AMP_SERVER
ARG REACT_APP_SERVER_URL
ARG REACT_APP_API_DATA_SOURCE

ENV REACT_APP_BASE_URL=$REACT_APP_BASE_URL
ENV REACT_APP_AMP_SERVER=$REACT_APP_AMP_SERVER
ENV REACT_APP_SERVER_URL=$REACT_APP_SERVER_URL
ENV REACT_APP_API_DATA_SOURCE=$REACT_APP_API_DATA_SOURCE
RUN npm run build:noenv

FROM httpd:alpine AS production

RUN sed -i 's/#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf && \
    sed -i 's/AllowOverride None/AllowOverride All/' /usr/local/apache2/conf/httpd.conf
WORKDIR /usr/local/apache2/htdocs/
COPY --from=builder /app/build /usr/local/apache2/htdocs
COPY --from=builder /app/.htaccess /usr/local/apache2/htdocs

EXPOSE 80