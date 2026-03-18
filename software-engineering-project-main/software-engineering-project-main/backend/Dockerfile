FROM node:18-alpine

# Better-sqlite3 build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Initialize DB on start if needed (or handoff to a start script)
# For now, just run the server
EXPOSE 3000

CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
