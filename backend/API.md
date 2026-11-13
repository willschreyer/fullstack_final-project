# API Contract (frontend and backend agree on this)

Base URL: `http://localhost:4000/api`
All bodies are JSON. Only two verbs: POST to create, GET to read.

## Envelope

Every success: `{ "data": ... }`
Every error: `{ "error": { "code": "VALIDATION" | "NOT_FOUND" | "SERVER", "message": "..." } }`

IDs are strings. Dates are ISO 8601 strings in UTC.

## Objects

### Thread
```json
{
  "id": "6730f1c2a9e4b1d2c3f40a11",
  "topic": "Best study spots on campus",
  "body": "Falvey after 10pm?",
  "author": "will",
  "postCount": 3,
  "lastActivityAt": "2026-11-10T23:41:00.000Z",
  "createdAt": "2026-11-10T22:05:12.000Z",
  "updatedAt": "2026-11-10T23:41:00.000Z"
}
```
Limits: topic 1 to 120 chars (required), body up to 5000 chars (optional), author 1 to 40 chars (required).

### Post (a message inside a thread)
```json
{
  "id": "6730f9e0a9e4b1d2c3f40a2b",
  "threadId": "6730f1c2a9e4b1d2c3f40a11",
  "author": "sam",
  "body": "Third floor quiet zone",
  "createdAt": "2026-11-10T23:41:00.000Z"
}
```
Limits: body 1 to 5000 chars (required), author 1 to 40 chars (required).

## Endpoints

| Method | Path | Request body | Response `data` |
|---|---|---|---|
| GET | `/threads?limit=20&before=<ISO>` | none | `Thread[]`, newest activity first, plus top level `nextCursor` |
| POST | `/threads` | `{ topic, body?, author }` | `Thread` (201) |
| GET | `/threads/:id` | none | `{ thread: Thread, posts: Post[] }`, posts oldest first |
| POST | `/threads/:id/posts` | `{ author, body }` | `Post` (201) |
| GET | `/health` | none | `{ ok: true }` |

Paging the feed: pass the `nextCursor` value from the last response as `before`. `nextCursor` is `null` when there is nothing more.

## Live updates (Socket.IO, same port)

| Event | Direction | Payload | When |
|---|---|---|---|
| `thread:new` | server to all clients | `Thread` | someone creates a thread |
| `thread:join` | client to server | thread id string | user opens a thread page |
| `thread:leave` | client to server | thread id string | user leaves a thread page |
| `post:new` | server to clients in that thread | `Post` | someone posts in the thread |

Frontend snippet:
```js
import { io } from "socket.io-client";
const socket = io("http://localhost:4000");
socket.on("thread:new", (t) => addToFeed(t));
socket.emit("thread:join", threadId);
socket.on("post:new", (p) => appendPost(p));
```

## Run it

```
npm install
cp .env.example .env   # put your Atlas URI in MONGODB_URI
npm run dev
```
With no `MONGODB_URI`, it starts an in memory Mongo so you can develop without Atlas (data resets on restart).
