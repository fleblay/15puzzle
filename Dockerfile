FROM node:18-alpine

RUN apk update && apk add bash

WORKDIR /www/vite
COPY ./launch.sh .
CMD ["./launch.sh"]
