const { Schema, model } = require("mongoose");

const threadSchema = new Schema(
  {
    topic: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, default: "", trim: true, maxlength: 5000 },
    author: { type: String, required: true, trim: true, maxlength: 40 },
    postCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

threadSchema.index({ lastActivityAt: -1 });

threadSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = model("Thread", threadSchema);
