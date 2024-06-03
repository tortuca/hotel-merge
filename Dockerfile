FROM node:slim

ENV NODE_ENV development
ENV PORT 3000
ENV SUPPLIERS https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme,https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia,https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies
ENV MONGO_URL mongodb://127.0.0.1:27017/suppliers
ENV ENABLE_DOWNLOAD true

WORKDIR /hotel-merge

# copy all files in project
COPY . .

RUN mkdir -p /hotel-merge/dist/data
RUN npm install

CMD ["npm", "run", "build"]
CMD ["npm", "start"]

EXPOSE 3000