const router = require("express").Router();
const { isValidObjectId } = require("mongoose");
const Thread = require("../models/Thread");
const Post = require("../models/Post");

const bad = (res, code, message, status = 400) =>
  res.status(status).json({ error: { code, message } });

// GET /api/threads?limit=20&before=<ISO date>
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const filter = req.query.before ? { lastActivityAt: { $lt: new Date(req.query.before) } } : {};
    const threads = await Thread.find(filter).sort({ lastActivityAt: -1 }).limit(limit);
    const nextCursor = threads.length === limit ? threads.at(-1).lastActivityAt.toISOString() : null;
    res.json({ data: threads, nextCursor });
  } catch (e) { next(e); }
});

// POST /api/threads  { topic, body?, author }
router.post("/", async (req, res, next) => {
  try {
    const { topic, body = "", author } = req.body || {};
    if (!topic?.trim()) return bad(res, "VALIDATION", "topic is required");
    if (!author?.trim()) return bad(res, "VALIDATION", "author is required");
    const thread = await Thread.create({ topic, body, author });
    req.app.get("io").emit("thread:new", thread);
    res.status(201).json({ data: thread });
  } catch (e) { next(e); }
});

// GET /api/threads/:id  -> thread plus all its posts, oldest first
router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) return bad(res, "NOT_FOUND", "thread not found", 404);
    const thread = await Thread.findById(req.params.id);
    if (!thread) return bad(res, "NOT_FOUND", "thread not found", 404);
    const posts = await Post.find({ threadId: thread._id }).sort({ createdAt: 1 });
    res.json({ data: { thread, posts } });
  } catch (e) { next(e); }
});

// POST /api/threads/:id/posts  { author, body }
router.post("/:id/posts", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) return bad(res, "NOT_FOUND", "thread not found", 404);
    const { author, body } = req.body || {};
    if (!author?.trim()) return bad(res, "VALIDATION", "author is required");
    if (!body?.trim()) return bad(res, "VALIDATION", "body is required");
    const thread = await Thread.findByIdAndUpdate(
      req.params.id,
      { $inc: { postCount: 1 }, $set: { lastActivityAt: new Date() } },
      { new: true }
    );
    if (!thread) return bad(res, "NOT_FOUND", "thread not found", 404);
    const post = await Post.create({ threadId: thread._id, author, body });
    req.app.get("io").to(`thread:${thread.id}`).emit("post:new", post);
    res.status(201).json({ data: post });
  } catch (e) { next(e); }
});

module.exports = router;
