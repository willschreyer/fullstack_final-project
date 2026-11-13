# Threads Backend

Node, Express, MongoDB Atlas, Socket.IO.

## Start

```
npm install
cp .env.example .env    # set MONGODB_URI (ask Will)
npm run dev
```

Runs at `http://localhost:4000/api`

## Use

```
GET  /threads              all threads, newest activity first
POST /threads              { topic, author, body? }
GET  /threads/:id          { thread, posts }
POST /threads/:id/posts    { author, body }
```

Send JSON with the header `Content-Type: application/json`.

## JSON

Success: `{ "data": ... }`
Error: `{ "error": { "code": "...", "message": "..." } }`

Thread
```json
{
  "id": "6730f1c2a9e4b1d2c3f40a11",
  "topic": "Best study spots",
  "body": "Falvey after 10pm?",
  "author": "will",
  "postCount": 3,
  "lastActivityAt": "2026-11-10T23:41:00.000Z",
  "createdAt": "2026-11-10T22:05:12.000Z",
  "updatedAt": "2026-11-10T23:41:00.000Z"
}
```

Post
```json
{
  "id": "6730f9e0a9e4b1d2c3f40a2b",
  "threadId": "6730f1c2a9e4b1d2c3f40a11",
  "author": "sam",
  "body": "Third floor quiet zone",
  "createdAt": "2026-11-10T23:41:00.000Z"
}
```

## Live updates

```js
const socket = io("http://localhost:4000");
socket.on("thread:new", (thread) => {});   // any new thread
socket.emit("thread:join", threadId);      // on opening a thread
socket.on("post:new", (post) => {});       // new post in that thread
```

Full details: `API.md`
