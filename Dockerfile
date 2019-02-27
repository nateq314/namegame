FROM node:8
MAINTAINER Nathan Quarles <nateq314@gmail.com>
RUN apt-key adv --fetch-keys http://dl.yarnpkg.com/debian/pubkey.gpg && \
  echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && apt-get install -y \
  yarn
COPY . /app
WORKDIR /app
RUN yarn install && yarn build
CMD ["yarn", "serve"]

EXPOSE 5000