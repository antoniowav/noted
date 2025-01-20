import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  shared: {
    type: Boolean,
    default: false,
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true,
  },
  tags: [{ type: String }],
  category: { type: String },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

noteSchema.index({ userId: 1 });

export const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
