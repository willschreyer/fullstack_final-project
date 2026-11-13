const { Schema, model, Types } = require("mongoose");

const postSchema = new Schema(
  {
    threadId: { type: Types.ObjectId, ref: "Thread", required: true, index: true },
    author: { type: String, required: true, trim: true, maxlength: 40 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

postSchema.index({ threadId: 1, createdAt: 1 });

postSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.threadId = ret.threadId.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = model("Post", postSchema);
