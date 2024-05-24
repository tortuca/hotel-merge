FROM node:slim

ENV NODE_ENV development
ENV PORT 3000
ENV SUPPLIERS https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme,https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia,https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies

WORKDIR /hotel-merge

# copy all files in project
COPY . .

RUN npm install

CMD ["npm", "build"]
CMD ["npm", "start"]

EXPOSE 3000