import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    category: String,
    userId: String,
    userEmail: String,
    shared: { type: Boolean, default: false },
    shareId: { type: String, default: null },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    reminder: {
      date: Date,
      sent: Boolean,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
