require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const buildApp = require("./app");

async function start() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri();
    console.log("No MONGODB_URI set, using in memory Mongo (data resets on restart)");
  }
  await mongoose.connect(uri);

  const server = http.createServer();
  const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN || "*" } });
  io.on("connection", (socket) => {
    socket.on("thread:join", (id) => socket.join(`thread:${id}`));
    socket.on("thread:leave", (id) => socket.leave(`thread:${id}`));
  });
  server.on("request", buildApp(io));

  const port = process.env.PORT || 4000;
  server.listen(port, () => console.log(`API on http://localhost:${port}`));
}

start().catch((e) => { console.error(e); process.exit(1); });
