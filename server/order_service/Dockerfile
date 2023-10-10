FROM nikolaik/python-nodejs:python3.11-nodejs18
WORKDIR /usr/src/order-server
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN pip install -r ./python_script/requirements.txt

EXPOSE 5000
CMD ["yarn", "server"]